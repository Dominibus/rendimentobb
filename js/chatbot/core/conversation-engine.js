// ===============================================
// 🧠 CONVERSATION ENGINE
// Silicon Valley AI 2026
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
        .trim()
        .toLowerCase();

    const isShortQuestion =

        text.length <= 20;

    const isFollowUp =

        [
            "e?",
            "quindi?",
            "conviene?",
            "perché?",
            "why?",
            "and?",
            "ok",
            "bene",
            "allora?"
        ].includes(text);

    const hasAnalysis =

        !!executiveContext?.liveData;

    return{

        intent:

            intent?.intent ||

            "generic",

        originalMessage:

            message,

        isShortQuestion,

        isFollowUp,

        hasAnalysis,

        entities,

        memory,

        advisor,

        executiveContext,

        investorProfile,

        aiBrain

    };

};

console.log(
    "🧠 CONVERSATION ENGINE READY"
);
