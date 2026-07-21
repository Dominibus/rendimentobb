// ===============================================
// 🧠 CONVERSATION ENGINE 2.0
// Silicon Valley AI 2026
// Conversational Context Builder
// ===============================================

window.rbBuildConversationContext = function({

    message = "",

    intent = {},

    entities = {},

    memory = {},

    executiveContext = {},

    investorProfile = {},

    aiBrain = {},

    advisor = {}

} = {}){

    const text =

        String(message || "")
        .trim();

    const normalized =

        text.toLowerCase();

    // ===========================================
    // 💬 MESSAGE ANALYSIS
    // ===========================================

    const wordCount =

        normalized
            .split(/\s+/)
            .filter(Boolean)
            .length;

    const isShortQuestion =

        normalized.length <= 20;

    const isGreeting =

        [
            "ciao",
            "salve",
            "hello",
            "hi",
            "buongiorno",
            "buonasera"
        ].includes(normalized);

    const isFollowUp =

        [

            "e?",

            "quindi?",

            "conviene?",

            "perché?",

            "why?",

            "ok",

            "bene",

            "allora?",

            "continua",

            "spiegami",

            "explain",

            "dimmi di più",

            "go on"

        ].includes(normalized);

    // ===========================================
    // 📊 ANALYSIS STATE
    // ===========================================

    const hasAnalysis =

        Boolean(

            advisor ||

            memory?.lastROI ||

            window.lastAnalysisData?.realROI ||

            window.lastAnalysisData?.roi ||

            executiveContext?.liveData

        );

    // ===========================================
    // 🧠 CONVERSATION GOAL
    // ===========================================

    let goal = "generic";

    if(isGreeting){

        goal = "greeting";

    }

    else if(isFollowUp){

        goal = "follow_up";

    }

    else if(intent?.intent){

        goal = intent.intent;

    }

    // ===========================================
    // 📚 MEMORY STATE
    // ===========================================

    const hasMemory =

        Boolean(

            memory?.messages?.length ||

            memory?.lastROI ||

            memory?.lastCity

        );

    // ===========================================
    // 🎯 CONTEXT SCORE
    // ===========================================

    let contextConfidence = 50;

    if(hasAnalysis) contextConfidence += 20;

    if(hasMemory) contextConfidence += 10;

    if(isFollowUp) contextConfidence += 10;

    if(intent?.confidence){

        contextConfidence +=
            Math.round(intent.confidence * 10);

    }

    contextConfidence =

        Math.min(
            100,
            contextConfidence
        );

    // ===========================================
    // 🚀 FINAL CONTEXT
    // ===========================================

    return{

        intent:

            intent?.intent ||

            "generic",

        goal,

        originalMessage:

            text,

        normalizedMessage:

            normalized,

        wordCount,

        isShortQuestion,

        isGreeting,

        isFollowUp,

        hasAnalysis,

        hasMemory,

        contextConfidence,

        entities,

        memory,

        advisor,

        executiveContext,

        investorProfile,

        aiBrain

    };

};

console.log(
    "🧠 CONVERSATION ENGINE 2.0 READY"
);
