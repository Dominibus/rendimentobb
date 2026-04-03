import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  try{

    const { email, lang = "it", step = 2 } = req.body;

    if(!email){
      return res.status(400).json({ error: "Email missing" });
    }

    const content = {

      it: {
        2: {
          subject: "🔥 72% degli investitori sbaglia questo",
          html: `
          <h2>Stai sottovalutando il rischio</h2>

          <p>Molti pensano di avere un ROI del 10-12%.</p>

          <p>Quando analizzano davvero i dati scoprono che è sotto il 5%.</p>

          <p>
          👉 <a href="https://www.rendimentobb.it/tool/">Verifica subito il tuo investimento</a>
          </p>
          `
        },

        3: {
          subject: "⚠️ Ultimo avviso prima di investire",
          html: `
          <h2>Ultimo controllo prima di spendere soldi</h2>

          <p>Un investimento sbagliato può costarti migliaia di euro.</p>

          <p>Ti bastano 30 secondi per evitarlo.</p>

          <p>
          👉 <a href="https://www.rendimentobb.it/tool/">Fai ora l’analisi completa</a>
          </p>
          `
        }
      },

      en: {
        2: {
          subject: "🔥 72% of investors get this wrong",
          html: `
          <h2>You may be underestimating risk</h2>

          <p>Many think they have 10-12% ROI.</p>

          <p>Real data shows it’s often below 5%.</p>

          <p>
          👉 <a href="https://www.rendimentobb.it/tool/">Check your investment now</a>
          </p>
          `
        },

        3: {
          subject: "⚠️ Final check before investing",
          html: `
          <h2>Last chance before you invest</h2>

          <p>A wrong investment can cost thousands.</p>

          <p>Check it in 30 seconds.</p>

          <p>
          👉 <a href="https://www.rendimentobb.it/tool/">Run full analysis now</a>
          </p>
          `
        }
      }

    };

    const selected = content[lang][step];

    await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",
      to: [email],
      subject: selected.subject,
      html: selected.html
    });

    return res.status(200).json({ success: true });

  }catch(err){
    console.error(err);
    return res.status(500).json({ error: "Email failed" });
  }

}
