import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= HELPER =================
function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= TEMPLATE =================
function buildEmail({ lang, step }){

  const CTA = "https://www.rendimentobb.it/tool/";

  const content = {

    2: {
      title: t(lang,
        "Stai sottovalutando il rischio",
        "You may be underestimating risk"
      ),
      text: t(lang,
        "Molti investimenti sembrano profittevoli all’inizio, ma i dati reali raccontano una storia diversa.",
        "Many investments look profitable at first, but real data tells a different story."
      ),
      highlight: t(lang,
        "Il problema non è il ROI… ma ciò che non stai vedendo.",
        "The problem isn’t ROI… but what you are not seeing."
      ),
      subject: t(lang,
        "Analisi investimento (attenzione)",
        "Investment analysis (important)"
      )
    },

    3: {
      title: t(lang,
        "Ultimo controllo prima di investire",
        "Final check before investing"
      ),
      text: t(lang,
        "Un investimento sbagliato può costarti molto più del previsto.",
        "A wrong investment can cost much more than expected."
      ),
      highlight: t(lang,
        "Un controllo ora può evitarti errori costosi.",
        "A quick check now can prevent costly mistakes."
      ),
      subject: t(lang,
        "Controllo finale investimento",
        "Final investment check"
      )
    }

  };

  const c = content[step];

  return {
    subject: c.subject,

    // ✅ VERSIONE TESTO (ANTI-SPAM)
    text: `
${c.title}

${c.text}

${c.highlight}

Analizza ora:
${CTA}
`,

    html: `
    <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

      <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

        <div style="text-align:center;margin-bottom:25px">
          <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
        </div>

        <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
          ${c.title}
        </h2>

        <p style="text-align:center;color:#64748b;font-size:15px">
          ${c.text}
        </p>

        <div style="
          margin-top:20px;
          background:#fff7ed;
          padding:16px;
          border-radius:12px;
          color:#92400e;
          font-weight:600;
          text-align:center;
        ">
          ${c.highlight}
        </div>

        <div style="
          margin-top:25px;
          background:#f8fafc;
          padding:18px;
          border-radius:12px;
          font-size:14px;
          color:#334155;
        ">
          <ul style="margin:0;padding-left:18px;line-height:1.7">
            <li>${t(lang,"ROI reale","Real ROI")}</li>
            <li>${t(lang,"Break-even","Break-even point")}</li>
            <li>${t(lang,"Impatto mutuo","Mortgage impact")}</li>
            <li>${t(lang,"Scenario rischio","Risk scenario")}</li>
          </ul>
        </div>

        <div style="text-align:center;margin:35px 0">

          <a href="${CTA}"
          style="
          background:#10b981;
          color:white;
          padding:16px 28px;
          border-radius:999px;
          text-decoration:none;
          font-weight:700;
          display:inline-block;
          ">
          ${t(lang,"Apri analisi","Open analysis")}
          </a>

          <p style="font-size:12px;color:#94a3b8;margin-top:10px">
            ${t(lang,
              "Disponibile in pochi secondi",
              "Available in seconds"
            )}
          </p>

        </div>

        <p style="text-align:center;font-size:12px;color:#94a3b8">
          RendimentoBB
        </p>

      </div>

    </div>
    `
  };
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  try{

    const { email, lang = "it", step = 2 } = req.body;

    if(!email){
      return res.status(400).json({ error: "Email missing" });
    }

    const emailContent = buildEmail({ lang, step });

    await resend.emails.send({
      from: "RendimentoBB Analisi <analisi@rendimentobb.it>",
      to: [email],
      subject: emailContent.subject,

      // ✅ FONDAMENTALE
      text: emailContent.text,

      html: emailContent.html
    });

    return res.status(200).json({ success: true });

  }catch(err){

    console.error(err);

    return res.status(500).json({ error: "Email failed" });
  }

}
