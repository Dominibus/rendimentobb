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

    const previousUserMessage =

        String(memory?.lastUserMessage || "")
        .trim();

    const previousAssistantMessage =

        String(memory?.lastAssistantMessage || "")
        .trim();

    const hasConversationHistory =

        Boolean(
            memory?.messages?.length ||
            previousUserMessage ||
            previousAssistantMessage
        );

    const detectTopic = function(value = ""){

        const source =
            String(value || "")
            .toLowerCase();

        const topicPatterns = {

            risk:
                /\b(rischio|risk|rischioso|risky)\b/i,

            cashflow:
                /\b(cash[\s-]?flow|flusso di cassa)\b/i,

            roi:
                /\b(roi|rendimento|return)\b/i,

            score:
                /\b(score|punteggio|investment score)\b/i,

            verdict:
                /\b(verdetto|verdict|conviene|worth it|buy|wait|avoid)\b/i,

            occupancy:
                /\b(occupazione|occupancy|tasso di occupazione)\b/i,

            adr:
                /\b(adr|prezzo medio|tariffa media|nightly rate|price per night)\b/i,

            mortgage:
                /\b(mutuo|mortgage|ltv|leva|leverage)\b/i,

            expenses:
                /\b(costi|spese|expenses|costs)\b/i,

            market:
                /\b(mercato|market|città|city)\b/i

        };

        return (
            Object
                .entries(topicPatterns)
                .find(([, pattern]) => pattern.test(source))
                ?.[0] || null
        );

    };

    const currentTopic =

        detectTopic(normalized);

    const previousTopic =

        detectTopic(previousUserMessage) ||
        detectTopic(previousAssistantMessage);

    const hasReferenceCue =

        /^(e\b|ed\b|ma\b|quindi\b|allora\b|quest[oa]\b|quello\b|quella\b|perch[eé]\b|spiegami\b|confronta(?:lo|la)?\b|what about\b|and\b|but\b|so\b|this\b|that\b|why\b|explain\b|compare\b)/i
        .test(normalized);

    const explicitFollowUps = [

        "e?",

        "quindi?",

        "conviene?",

        "perché?",

        "perche?",

        "why?",

        "ok",

        "bene",

        "allora?",

        "continua",

        "spiegami",

        "explain",

        "dimmi di più",

        "go on"

    ];

    const isFollowUp =

        explicitFollowUps.includes(normalized) ||

        Boolean(
            hasConversationHistory &&
            (
                hasReferenceCue ||
                (
                    isShortQuestion &&
                    currentTopic
                )
            )
        );

    const resolvedTopic =

        currentTopic ||
        memory?.lastIntent ||
        previousTopic ||
        null;

    const referenceMessage =

        isFollowUp
            ? previousAssistantMessage || previousUserMessage || null
            : null;

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

        hasConversationHistory,

        currentTopic,

        previousTopic,

        resolvedTopic,

        referenceMessage,

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

// Production: nessun log
