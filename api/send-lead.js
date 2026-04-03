// /api/send-lead.js

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({error:"Method not allowed"});
  }

  const lead = req.body;

  try{

    let destinationEmail = "";

    // =========================
    // ROUTING AUTOMATICO
    // =========================

    if(lead.type === "mutui"){
      destinationEmail = "banca@partner.com";
    }

    if(lead.type === "immobili"){
      destinationEmail = "agenzia@partner.com";
    }

    if(lead.type === "partner"){
      destinationEmail = "rendimentobb@gmail.com";
    }

    if(lead.type === "work"){
      destinationEmail = "rendimentobb@gmail.com";
    }

    // =========================
    // EMAIL (RESEND API 🔥)
    // =========================

    await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        from: "RendimentoBB <onboarding@resend.dev>",
        to: destinationEmail,
        subject: "🔥 Nuovo Lead RendimentoBB",
        html: `
        <h2>Nuovo lead ricevuto</h2>
        <p><b>Email:</b> ${lead.email}</p>
        <p><b>Dati:</b> ${JSON.stringify(lead)}</p>
        `
      })
    });

    return res.status(200).json({success:true});

  }catch(err){

    console.error(err);
    return res.status(500).json({error:"Errore invio lead"});

  }

}
