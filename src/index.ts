import {EmailMessage} from "cloudflare:email"
import {createMimeMessage} from "mimetext"

const noreply: string[] = [
    'noreply',
    'no-reply',
    'no_reply'
]
const problem: string[] = [
    "MAILER-DAEMON",
    "mailer-daemon",
    "bounce",
    "abuse",
    "postmaster",
    "post-master"
]
const ok: string[] = [
    "admin",
    "nfe",
    "kommo",
    "kommopartner",
    "kommo_partner",
    "kommo-partner",
    "contato",
    "suporte",
    "contatos",
    "contact",
    "lead",
    "followup",
    "pipe",
    "agenda",
    "abuse",
    "postmaster",
    "whois",
    "davi",
]

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async email(message: ForwardableEmailMessage, env: any, ctx: any) {
        const emailDef = "davimesquita@gmail.com"

        const to = message.to.split('@')[0];
        const from = message.from.split('@')[0];

        if (
            ok.filter(e => e === to).length > 0
            || problem.filter(e => e === from).length > 0
        ) {

            await message.forward(emailDef)

        } else if (
            noreply.filter(e => e === to).length > 0
        ) {

            const data = 'Olá,\n\n' +
                    'Você tentou entrar em contato à um endereço de e-mail que não existe em nosso sistema. \n\n' +
                    'Por favor, verifique o endereço de e-mail e tente novamente. Se você acredita que isso é um erro, entre em contato com nosso suporte.'

                // `Por favor, entre em contato com o e-mail ${persona} para maiores informações.\n\n`
            ;

            let msgId = null;
            let msgSubject = "Casa Das Idéias - Contato";
            try {
                msgId = message.headers.get("message-id");
            } catch (e) {
            }
            if (isEmpty(msgId)) {
                try {
                    msgId = message.headers.get("Message-ID");
                } catch (e) {
                }
            }
            try {
                msgSubject = message.headers.get("subject")
            } catch (e) {
            }
            if (isEmpty(msgSubject)) {
                try {
                    msgSubject = message.headers.get("Subject")
                } catch (e) {
                }
            }

            const msg = createMimeMessage();
            if (!isEmpty(msgId)) {
                msg.setHeader("In-Reply-To", msgId);
            }
            msg.setSender({name: "Casa Das Idéias", addr: `noreply@ideias.casa`});
            msg.setRecipient(message.from);
            msg.setSubject(`RE: ${msgSubject}`);
            msg.addMessage({
                contentType: 'text/plain',
                data,
            });

            const reply = new EmailMessage(`noreply@ideias.casa`, message.from, msg.asRaw());

            //@ts-ignore
            await message.reply(reply);

        // } else {

            //---message.setReject(`421 4.7.28 Mailbox does not exist. `);
            //message.setReject(`550 5.1.1 Mailbox does not exist. `);

        }
    },

}

const HTTP_OK = () => new Response('200 Ok', {status: 200});
const HTTP_CREATED = () => new Response('201 Created', {status: 201});
const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});

function isEmpty(text: string): boolean {
    if (text === null || text === undefined) {
        return true;
    }
    let rt = text.trim();
    return rt.length === 0 || rt === 'null' || rt === 'undefined';
}
