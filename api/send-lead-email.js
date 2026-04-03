import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  try{

    const { email, lang = "it" } = req.body;

    if(!email){
      return res.status(400).json({ error: "Email missing" });
    }

    // =========================
    // ✉️ CONTENUTO EMAIL
    // =========================

    const content = {

      it: {
        subject: "⚠️ Il tuo investimento potrebbe perdere soldi",
        html: `
        <h2>Stai per fare un errore?</h2>

        <p>La maggior parte degli investimenti B&B non è profittevole.</p>

        <ul>
        <li>ROI falsato</li>
        <li>Costi sottostimati</li>
        <li>Mutuo che distrugge i margini</li>
        </ul>

        <p>
        👉 <a href="https://www.rendimentobb.it/tool/">Analizza subito il tuo investimento</a>
        </p>

        <p>Ti bastano 30 secondi.</p>
        `
      },

      en: {
        subject: "⚠️ Your investment may lose money",
        html: `
        <h2>Are you making a mistake?</h2>

        <p>Most B&B investments are NOT profitable.</p>

        <ul>
        <li>Fake ROI</li>
        <li>Hidden costs</li>
        <li>Mortgage destroys profit</li>
        </ul>

        <p>
        👉 <a href="https://www.rendimentobb.it/tool/">Analyze your investment now</a>
        </p>

        <p>It takes 30 seconds.</p>
        `
      }

    };

    const selected = content[lang] || content.it;

    // =========================
    // 🚀 INVIO EMAIL
    // =========================

    const data = await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",
      to: [email],
      subject: selected.subject,
      html: selected.html
    });

    return res.status(200).json({ success: true, data });

  }catch(err){
    console.error(err);
    return res.status(500).json({ error: "Email failed" });
  }

}
