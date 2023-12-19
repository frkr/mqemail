import {createMimeMessage} from 'mimetext';
import {EmailMessage} from "cloudflare:email";

interface Env {

}

const noreply = "no-reply@ideias.casa";
const persona = "davimesquita@gmail.com";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return HTTP_UNPROCESSABLE_ENTITY();
    },
    async email(message: ForwardableEmailMessage, env: Env, ctx: any) {

        const data = 'Olá,\n\n' +
                'Você tentou entrar em contato com um e-mail que não existe.\n\n'
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
        msg.setSender({name: "Casa Das Idéias", addr: noreply});
        msg.setRecipient(message.from);
        msg.setSubject(`RE: ${msgSubject}`);
        msg.addMessage({
            contentType: 'text/plain',
            data,
        });

        const reply = new EmailMessage(noreply, message.from, msg.asRaw());

        //@ts-ignore
        await message.reply(reply);

        await message.forward(persona);

        // TODO enviar isto para o modulo de email

        // const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
        // const parser = new PostalMime();
        // const parsedEmail = await parser.parse(rawEmail);
        //
        // if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
        //     for (const att of parsedEmail.attachments) {
        //         await env.wchatr2.put(att.filename, att.content);
        //     }
        // }

    },
}

const HTTP_OK = () => new Response('200 Ok', {status: 200});
const HTTP_CREATED = () => new Response('201 Created', {status: 201});
const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});

function isEmpty(text: string): boolean {
    return text === null || text === undefined || text === '' || text.trim() === '';
}
