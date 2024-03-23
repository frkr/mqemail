import {createMimeMessage} from 'mimetext';
import {EmailMessage} from "cloudflare:email";

interface Env {
    [key: string]: string;
}

const emails = {
    nfe: "casacasa+lead@mail.kommo.com",
    admin: "davimesquita@gmail.com",
    kommo: "casacasa+lead@mail.kommo.com",
    kommopartner: "casacasa+lead@mail.kommo.com",
    kommo_partner: "casacasa+lead@mail.kommo.com",
    contato: "casacasa+lead@mail.kommo.com",
    contatos: "casacasa+lead@mail.kommo.com",
    contact: "casacasa+lead@mail.kommo.com",
    lead: "casacasa+lead@mail.kommo.com",
    followup: "casacasa+lead@mail.kommo.com",
    pipe: "casacasa+lead@mail.kommo.com",
    agenda: "casacasa+lead@mail.kommo.com",
    abuse: "casacasa+lead@mail.kommo.com",
    postmaster: "casacasa+lead@mail.kommo.com",
    whois: "casacasa+lead@mail.kommo.com",
    davi: "casacasa+lead@mail.kommo.com",
    brunovbardi: "brunovbardi@gmail.com",
    paulo: "lubolos+lead@mail.kommo.com",
    lucilene: "lubolos+lead@mail.kommo.com",
    lubolos: "lubolos+lead@mail.kommo.com",
    lubolo: "lubolos+lead@mail.kommo.com",
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        // XXX atack protection
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async email(message: ForwardableEmailMessage, env: Env, ctx: any) {

        const to = message.to.split('@')[0];

        if (
            to === 'noreply' ||
            to === 'no-reply' ||
            to === 'no_reply'
        ) {
            return;
        }

        //---message.setReject(`421 4.7.28 Mailbox does not exist. https://www.${env.DKIM_DOMAIN}/ `);
        //+++message.setReject(`550 5.1.1 Mailbox does not exist. ${env.DKIM_DOMAIN} `);

        if (emails[to]) {
            await message.forward(emails[to]);
            return;
        }
        if (to.startsWith("marcelo")) {
            await message.forward(emails.admin);
            return;
        }

        let tmp = "";
        try {
            tmp = message.to + "";
        } catch (e) {
        }

        message.setReject(`550 5.1.1 Mailbox does not exist. ${tmp} :: https://${env.DKIM_DOMAIN}/ `);

        // TODO Conteudo do email parametrizavel?
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
        msg.setSender({name: "Casa Das Idéias", addr: `noreply@${env.DKIM_DOMAIN}`});
        msg.setRecipient(message.from);
        msg.setSubject(`RE: ${msgSubject}`);
        msg.addMessage({
            contentType: 'text/plain',
            data,
        });

        const reply = new EmailMessage(`noreply@${env.DKIM_DOMAIN}`, message.from, msg.asRaw());

        //@ts-ignore
        await message.reply(reply);

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
