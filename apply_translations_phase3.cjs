const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'locales');
const languages = ['en', 'hi', 'pa'];

const newTranslations = {
    health_trends: {
        en: {
            title: "Health Trends",
            subtitle: "Graph your vital signs and lab results over time.",
            bp_title: "Blood Pressure (Last 30 entries)",
            bp_desc: "Track your systolic and diastolic pressure.",
            sugar_title: "Blood Sugar (Last 30 entries)",
            sugar_desc: "Track your logged blood sugar readings.",
            lab_glucose_title: "Lab Result: Glucose",
            lab_glucose_desc: "Track your glucose results from lab tests over time.",
            med_adherence_title: "Medication Adherence",
            med_adherence_desc: "Your medication tracking consistency over the last 7 days.",
            symptom_map_title: "Symptom Frequency Map",
            symptom_map_desc: "Frequency and intensity of reported symptoms by time of day.",
            nutrition_title: "Nutrition Breakdown",
            nutrition_desc: "Daily macronutrient distribution tracking.",
            sleep_title: "Sleep Duration & Quality",
            sleep_desc: "Total sleep hours vs. Deep sleep stages."
        },
        hi: {
            title: "स्वास्थ्य प्रवृत्तियां (Health Trends)",
            subtitle: "समय के साथ अपने महत्वपूर्ण संकेतों और लैब परिणामों का ग्राफ़ देखें।",
            bp_title: "रक्तचाप (Blood Pressure - पिछले 30 रिकॉर्ड)",
            bp_desc: "अपना सिस्टोलिक और डायस्टोलिक रक्तचाप ट्रैक करें।",
            sugar_title: "रक्त शर्करा (Blood Sugar - पिछले 30 रिकॉर्ड)",
            sugar_desc: "अपनी दर्ज की गई रक्त शर्करा रीडिंग ट्रैक करें।",
            lab_glucose_title: "लैब परिणाम: ग्लूकोज (Glucose)",
            lab_glucose_desc: "लैब परीक्षणों से अपने ग्लूकोज परिणामों को ट्रैक करें।",
            med_adherence_title: "दवा का पालन (Medication Adherence)",
            med_adherence_desc: "पिछले 7 दिनों में आपकी दवा ट्रैकिंग की निरंतरता।",
            symptom_map_title: "लक्षण आवृत्ति मानचित्र",
            symptom_map_desc: "दिन के समय के अनुसार रिपोर्ट किए गए लक्षणों की आवृत्ति और तीव्रता।",
            nutrition_title: "पोषण विवरण (Nutrition Breakdown)",
            nutrition_desc: "दैनिक मैक्रोन्यूट्रिएंट वितरण ट्रैकिंग।",
            sleep_title: "नींद की अवधि और गुणवत्ता",
            sleep_desc: "कुल नींद के घंटे बनाम गहरी नींद के चरण।"
        },
        pa: {
            title: "ਸਿਹਤ ਰੁਝਾਨ (Health Trends)",
            subtitle: "ਸਮੇਂ ਦੇ ਨਾਲ ਆਪਣੇ ਮਹੱਤਵਪੂਰਨ ਸੰਕੇਤਾਂ ਅਤੇ ਲੈਬ ਨਤੀਜਿਆਂ ਦਾ ਗ੍ਰਾਫ ਦੇਖੋ।",
            bp_title: "ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ (Blood Pressure - ਪਿਛਲੇ 30 ਰਿਕਾਰਡ)",
            bp_desc: "ਆਪਣਾ ਸਿਸਟੋਲਿਕ ਅਤੇ ਡਾਇਸਟੋਲਿਕ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਟਰੈਕ ਕਰੋ।",
            sugar_title: "ਬਲੱਡ ਸ਼ੂਗਰ (Blood Sugar - ਪਿਛਲੇ 30 ਰਿਕਾਰਡ)",
            sugar_desc: "ਆਪਣੀ ਦਰਜ ਕੀਤੀ ਬਲੱਡ ਸ਼ੂਗਰ ਰੀਡਿੰਗ ਨੂੰ ਟਰੈਕ ਕਰੋ।",
            lab_glucose_title: "ਲੈਬ ਨਤੀਜਾ: ਗਲੂਕੋਜ਼ (Glucose)",
            lab_glucose_desc: "ਲੈਬ ਟੈਸਟਾਂ ਤੋਂ ਆਪਣੇ ਗਲੂਕੋਜ਼ ਦੇ ਨਤੀਜਿਆਂ ਨੂੰ ਟਰੈਕ ਕਰੋ।",
            med_adherence_title: "ਦਵਾਈ ਦੀ ਪਾਲਣਾ (Medication Adherence)",
            med_adherence_desc: "ਪਿਛਲੇ 7 ਦਿਨਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਦਵਾਈ ਟਰੈਕਿੰਗ ਦੀ ਨਿਰੰਤਰਤਾ।",
            symptom_map_title: "ਲੱਛਣ ਆਵਿਰਤੀ ਨਕਸ਼ਾ",
            symptom_map_desc: "ਦਿਨ ਦੇ ਸਮੇਂ ਦੁਆਰਾ ਰਿਪੋਰਟ ਕੀਤੇ ਗਏ ਲੱਛਣਾਂ ਦੀ ਆਵਿਰਤੀ ਅਤੇ ਤੀਬਰਤਾ।",
            nutrition_title: "ਪੋਸ਼ਣ ਬਰੇਕਡਾਊਨ (Nutrition Breakdown)",
            nutrition_desc: "ਰੋਜ਼ਾਨਾ ਮੈਕਰੋਨਿਊਟ੍ਰੀਐਂਟ ਵੰਡ ਟਰੈਕਿੰਗ।",
            sleep_title: "ਨੀਂਦ ਦੀ ਮਿਆਦ ਅਤੇ ਗੁਣਵੱਤਾ",
            sleep_desc: "ਕੁੱਲ ਨੀਂਦ ਦੇ ਘੰਟੇ ਬਨਾਮ ਡੂੰਘੀ ਨੀਂਦ ਦੇ ਪੜਾਅ।"
        }
    },
    food_journal: {
        en: {
            title: "Food Journal",
            subtitle: "Keep a diary of your meals to stay mindful of your eating habits.",
            log_meal_btn: "Log Meal",
            loading: "Loading your food journal...",
            no_meals: "No meals logged yet. Click 'Log Meal' to get started.",
            modal_title: "Log a New Meal",
            meal_type: "Meal Type",
            meal_breakfast: "Breakfast",
            meal_lunch: "Lunch",
            meal_dinner: "Dinner",
            meal_snack: "Snack",
            description: "Description",
            desc_placeholder: "e.g., Oatmeal with berries and nuts",
            cancel: "Cancel",
            delete_aria: "Delete {{meal}} log"
        },
        hi: {
            title: "भोजन डायरी (Food Journal)",
            subtitle: "अपने खाने की आदतों के प्रति सचेत रहने के लिए अपने भोजन की डायरी रखें।",
            log_meal_btn: "भोजन दर्ज करें",
            loading: "आपकी भोजन डायरी लोड हो रही है...",
            no_meals: "अभी तक कोई भोजन दर्ज नहीं किया गया है। आरंभ करने के लिए 'भोजन दर्ज करें' पर क्लिक करें।",
            modal_title: "नया भोजन दर्ज करें",
            meal_type: "भोजन का प्रकार",
            meal_breakfast: "नाश्ता",
            meal_lunch: "दोपहर का भोजन",
            meal_dinner: "रात का भोजन",
            meal_snack: "नाश्ता (Snack)",
            description: "विवरण",
            desc_placeholder: "उदा., जामुन और मेवे के साथ दलिया",
            cancel: "रद्द करें",
            delete_aria: "{{meal}} लॉग हटाएं"
        },
        pa: {
            title: "ਭੋਜਨ ਡਾਇਰੀ (Food Journal)",
            subtitle: "ਆਪਣੀਆਂ ਖਾਣ-ਪੀਣ ਦੀਆਂ ਆਦਤਾਂ ਪ੍ਰਤੀ ਸੁਚੇਤ ਰਹਿਣ ਲਈ ਆਪਣੇ ਭੋਜਨ ਦੀ ਡਾਇਰੀ ਰੱਖੋ।",
            log_meal_btn: "ਭੋਜਨ ਦਰਜ ਕਰੋ",
            loading: "ਤੁਹਾਡੀ ਭੋਜਨ ਡਾਇਰੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...",
            no_meals: "ਹਜੇ ਤੱਕ ਕੋਈ ਭੋਜਨ ਦਰਜ ਨਹੀਂ ਕੀਤਾ ਗਿਆ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ 'ਭੋਜਨ ਦਰਜ ਕਰੋ' 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
            modal_title: "ਨਵਾਂ ਭੋਜਨ ਦਰਜ ਕਰੋ",
            meal_type: "ਭੋਜਨ ਦੀ ਕਿਸਮ",
            meal_breakfast: "ਨਾਸ਼ਤਾ",
            meal_lunch: "ਦੁਪਹਿਰ ਦਾ ਖਾਣਾ",
            meal_dinner: "ਰਾਤ ਦਾ ਖਾਣਾ",
            meal_snack: "ਸਨੈਕ",
            description: "ਵਰਣਨ",
            desc_placeholder: "ਉਦਾਹਰਣ ਲਈ, ਬੇਰੀਆਂ ਅਤੇ ਗਿਰੀਆਂ ਦੇ ਨਾਲ ਓਟਮੀਲ",
            cancel: "ਰੱਦ ਕਰੋ",
            delete_aria: "{{meal}} ਲੌਗ ਹਟਾਓ"
        }
    },
    symptom_checker: {
        en: {
            title: "Symptom Checker",
            subtitle: "Answer questions to receive a recommendation for care.",
            card_title: "AI-Powered Symptom Checker",
            card_desc: "This tool does not provide a diagnosis. It is for informational purposes only.",
            start_prompt: "What is your primary symptom?",
            start_placeholder: "e.g., Sore throat, headache, fever",
            start_btn: "Start Analysis",
            typing: "Typing...",
            type_answer: "Type your answer...",
            send: "Send",
            triage: "Triage",
            start_over: "Start Over",
            find_er: "Find Nearest ER",
            schedule: "Schedule Appointment",
            explore: "Explore Health Library"
        },
        hi: {
            title: "लक्षण चेकर (Symptom Checker)",
            subtitle: "देखभाल के लिए अनुशंसा प्राप्त करने के लिए प्रश्नों के उत्तर दें।",
            card_title: "AI-संचालित लक्षण चेकर",
            card_desc: "यह टूल निदान प्रदान नहीं करता है। यह केवल सूचनात्मक उद्देश्यों के लिए है।",
            start_prompt: "आपका मुख्य लक्षण क्या है?",
            start_placeholder: "उदा., गले में खराश, सिरदर्द, बुखार",
            start_btn: "विश्लेषण शुरू करें",
            typing: "टाइप कर रहा है...",
            type_answer: "अपना उत्तर टाइप करें...",
            send: "भेजें",
            triage: "ट्राइएज (Triage)",
            start_over: "फिर से शुरू करें",
            find_er: "निकटतम ER खोजें",
            schedule: "अपॉइंटमेंट बुक करें",
            explore: "स्वास्थ्य लाइब्रेरी का अन्वेषण करें"
        },
        pa: {
            title: "ਲੱਛਣ ਚੈਕਰ (Symptom Checker)",
            subtitle: "ਦੇਖਭਾਲ ਲਈ ਸਿਫ਼ਾਰਸ਼ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦਿਓ।",
            card_title: "AI-ਸੰਚਾਲਿਤ ਲੱਛਣ ਚੈਕਰ",
            card_desc: "ਇਹ ਟੂਲ ਤਸ਼ਖੀਸ ਪ੍ਰਦਾਨ ਨਹੀਂ ਕਰਦਾ ਹੈ। ਇਹ ਸਿਰਫ ਜਾਣਕਾਰੀ ਦੇ ਉਦੇਸ਼ਾਂ ਲਈ ਹੈ।",
            start_prompt: "ਤੁਹਾਡਾ ਮੁੱਖ ਲੱਛਣ ਕੀ ਹੈ?",
            start_placeholder: "ਉਦਾਹਰਣ ਲਈ, ਗਲੇ ਵਿੱਚ ਖਰਾਸ਼, ਸਿਰਦਰਦ, ਬੁਖਾਰ",
            start_btn: "ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ",
            typing: "ਟਾਈਪ ਕਰ ਰਿਹਾ ਹੈ...",
            type_answer: "ਆਪਣਾ ਜਵਾਬ ਟਾਈਪ ਕਰੋ...",
            send: "ਭੇਜੋ",
            triage: "ਕ੍ਰਮਬੰਦੀ (Triage)",
            start_over: "ਦੁਬਾਰਾ ਸ਼ੁਰੂ ਕਰੋ",
            find_er: "ਨਜ਼ਦੀਕੀ ER ਲੱਭੋ",
            schedule: "ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
            explore: "ਹੈਲਥ ਲਾਇਬ੍ਰੇਰੀ ਦੀ ਪੜਚੋਲ ਕਰੋ"
        }
    },
    mentibot: {
        en: {
            badge: "DocuMedic AI Companion",
            standalone_mode: "Standalone Mode",
            hero_title_1: "Better mental",
            hero_title_2: "Health with AI",
            hero_desc: "A comprehensive mental health companion designed to help you navigate your emotions, track your growth, and find the support you need, whenever you need it.",
            talk_to_ai: "Talk to AI",
            wellness_tools: "Wellness Tools",
            system_status: "System Status",
            system_online: "AI ONLINE",
            privacy_level: "Privacy level",
            hipaa_ready: "HIPAA READY",
            platform: "Platform",
            ecosystem: "Ecosystem",
            power_tools: "Power tools for your emotional wellbeing journey",
            init_module: "Initialize Module",
            danger_title: "In immediate danger?",
            danger_desc: "Mentibot provides support, but if you are in a life-threatening crisis, please reach out to emergency services immediately.",
            emergency_btn: "Emergency Protocol",
            feature_sentiment_title: "Sentiment Analysis",
            feature_sentiment_desc: "AI-powered understanding of your emotional state through conversation.",
            feature_support_title: "Personalized Support",
            feature_support_desc: "Tailored mental health guidance based on your history and goals.",
            feature_crisis_title: "Crisis Detection",
            feature_crisis_desc: "24/7 monitoring for urgent situations with immediate professional alerts.",
            feature_exercises_title: "Therapeutic Exercises",
            feature_exercises_desc: "Evidence-based CBT and mindfulness activities for daily wellness.",
            feature_mood_title: "Mood Tracker",
            feature_mood_desc: "Visualize your emotional journey with daily mood logging.",
            feature_music_title: "Mood-Based Music",
            feature_music_desc: "Curated playlists that adapt to your current emotional needs.",
            feature_journal_title: "AI Journaling",
            feature_journal_desc: "Reflect on your day with guided prompts and sentiment feedback.",
            feature_library_title: "Resource Library",
            feature_library_desc: "Expansive collection of mental health articles and workshops."
        },
        hi: {
            badge: "DocuMedic AI साथी",
            standalone_mode: "स्टैंडअलोन मोड",
            hero_title_1: "एआई के साथ",
            hero_title_2: "बेहतर मानसिक स्वास्थ्य",
            hero_desc: "एक व्यापक मानसिक स्वास्थ्य साथी जो आपकी भावनाओं को नेविगेट करने, आपके विकास को ट्रैक करने और आवश्यकता पड़ने पर समर्थन खोजने में आपकी मदद करने के लिए डिज़ाइन किया गया है।",
            talk_to_ai: "AI से बात करें",
            wellness_tools: "कल्याण उपकरण (Wellness Tools)",
            system_status: "सिस्टम की स्थिति",
            system_online: "AI ऑनलाइन है",
            privacy_level: "गोपनीयता स्तर",
            hipaa_ready: "HIPAA तैयार",
            platform: "प्लेटफ़ॉर्म",
            ecosystem: "पारिस्थितिकी तंत्र (Ecosystem)",
            power_tools: "आपकी भावनात्मक भलाई यात्रा के लिए पावर टूल्स",
            init_module: "मॉड्यूल प्रारंभ करें",
            danger_title: "क्या आप तत्काल खतरे में हैं?",
            danger_desc: "Mentibot सहायता प्रदान करता है, लेकिन यदि आप जानलेवा संकट में हैं, तो कृपया तुरंत आपातकालीन सेवाओं से संपर्क करें।",
            emergency_btn: "आपातकालीन प्रोटोकॉल",
            feature_sentiment_title: "भावना विश्लेषण (Sentiment Analysis)",
            feature_sentiment_desc: "बातचीत के माध्यम से आपकी भावनात्मक स्थिति की AI-संचालित समझ।",
            feature_support_title: "व्यक्तिगत सहायता",
            feature_support_desc: "आपके इतिहास और लक्ष्यों के आधार पर अनुरूप मानसिक स्वास्थ्य मार्गदर्शन।",
            feature_crisis_title: "संकट का पता लगाना (Crisis Detection)",
            feature_crisis_desc: "तत्काल पेशेवर अलर्ट के साथ तत्काल स्थितियों के लिए 24/7 निगरानी।",
            feature_exercises_title: "चिकित्सीय व्यायाम (Therapeutic Exercises)",
            feature_exercises_desc: "दैनिक कल्याण के लिए साक्ष्य-आधारित CBT और माइंडफुलनेस गतिविधियां।",
            feature_mood_title: "मनःस्थिति ट्रैकर (Mood Tracker)",
            feature_mood_desc: "दैनिक मूड लॉगिंग के साथ अपनी भावनात्मक यात्रा की कल्पना करें।",
            feature_music_title: "मूड-आधारित संगीत",
            feature_music_desc: "क्यूरेटेड प्लेलिस्ट जो आपकी वर्तमान भावनात्मक आवश्यकताओं के अनुकूल हैं।",
            feature_journal_title: "AI जर्नलिंग",
            feature_journal_desc: "निर्देशित संकेतों और भावना प्रतिक्रिया के साथ अपने दिन पर विचार करें।",
            feature_library_title: "संसाधन पुस्तकालय",
            feature_library_desc: "मानसिक स्वास्थ्य लेखों और कार्यशालाओं का व्यापक संग्रह।"
        },
        pa: {
            badge: "DocuMedic AI ਸਾਥੀ",
            standalone_mode: "ਸਟੈਂਡਅਲੋਨ ਮੋਡ",
            hero_title_1: "AI ਦੇ ਨਾਲ",
            hero_title_2: "ਬਿਹਤਰ ਮਾਨਸਿਕ ਸਿਹਤ",
            hero_desc: "ਇੱਕ ਵਿਆਪਕ ਮਾਨਸਿਕ ਸਿਹਤ ਸਾਥੀ ਜੋ ਤੁਹਾਡੀਆਂ ਭਾਵਨਾਵਾਂ ਨੂੰ ਨੈਵੀਗੇਟ ਕਰਨ, ਤੁਹਾਡੇ ਵਿਕਾਸ ਨੂੰ ਟਰੈਕ ਕਰਨ, ਅਤੇ ਲੋੜ ਪੈਣ 'ਤੇ ਸਹਾਇਤਾ ਲੱਭਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ।",
            talk_to_ai: "AI ਨਾਲ ਗੱਲ ਕਰੋ",
            wellness_tools: "ਤੰਦਰੁਸਤੀ ਟੂਲ (Wellness Tools)",
            system_status: "ਸਿਸਟਮ ਦੀ ਸਥਿਤੀ",
            system_online: "AI ਆਨਲਾਈਨ ਹੈ",
            privacy_level: "ਗੋਪਨੀਯਤਾ ਪੱਧਰ",
            hipaa_ready: "HIPAA ਤਿਆਰ",
            platform: "ਪਲੇਟਫਾਰਮ",
            ecosystem: "ਈਕੋਸਿਸਟਮ",
            power_tools: "ਤੁਹਾਡੀ ਭਾਵਨਾਤਮਕ ਤੰਦਰੁਸਤੀ ਯਾਤਰਾ ਲਈ ਪਾਵਰ ਟੂਲ",
            init_module: "ਮੋਡੀਊਲ ਸ਼ੁਰੂ ਕਰੋ",
            danger_title: "ਕੀ ਤੁਸੀਂ ਤੁਰੰਤ ਖ਼ਤਰੇ ਵਿੱਚ ਹੋ?",
            danger_desc: "Mentibot ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ, ਪਰ ਜੇਕਰ ਤੁਸੀਂ ਜਾਨਲੇਵਾ ਸੰਕਟ ਵਿੱਚ ਹੋ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
            emergency_btn: "ਐਮਰਜੈਂਸੀ ਪ੍ਰੋਟੋਕੋਲ",
            feature_sentiment_title: "ਭਾਵਨਾ ਵਿਸ਼ਲੇਸ਼ਣ (Sentiment Analysis)",
            feature_sentiment_desc: "ਗੱਲਬਾਤ ਰਾਹੀਂ ਤੁਹਾਡੀ ਭਾਵਨਾਤਮਕ ਸਥਿਤੀ ਦੀ AI-ਸੰਚਾਲਿਤ ਸਮਝ।",
            feature_support_title: "ਵਿਅਕਤੀਗਤ ਸਹਾਇਤਾ",
            feature_support_desc: "ਤੁਹਾਡੇ ਇਤਿਹਾਸ ਅਤੇ ਟੀਚਿਆਂ ਦੇ ਅਧਾਰ ਤੇ ਅਨੁਕੂਲ ਮਾਨਸਿਕ ਸਿਹਤ ਮਾਰਗਦਰਸ਼ਨ।",
            feature_crisis_title: "ਸੰਕਟ ਦਾ ਪਤਾ ਲਗਾਉਣਾ (Crisis Detection)",
            feature_crisis_desc: "ਤੁਰੰਤ ਪੇਸ਼ੇਵਰ ਸੁਚੇਤਨਾਵਾਂ ਦੇ ਨਾਲ ਜ਼ਰੂਰੀ ਸਥਿਤੀਆਂ ਲਈ 24/7 ਨਿਗਰਾਨੀ।",
            feature_exercises_title: "ਉਪਚਾਰਕ ਕਸਰਤਾਂ (Therapeutic Exercises)",
            feature_exercises_desc: "ਰੋਜ਼ਾਨਾ ਤੰਦਰੁਸਤੀ ਲਈ ਸਬੂਤ-ਆਧਾਰਿਤ CBT ਅਤੇ ਮਾਈਂਡਫੁਲਨੈੱਸ ਗਤੀਵਿਧੀਆਂ।",
            feature_mood_title: "ਮੂਡ ਟਰੈਕਰ (Mood Tracker)",
            feature_mood_desc: "ਰੋਜ਼ਾਨਾ ਮੂਡ ਲੌਗਿੰਗ ਦੇ ਨਾਲ ਆਪਣੀ ਭਾਵਨਾਤਮਕ ਯਾਤਰਾ ਦੀ ਕਲਪਨਾ ਕਰੋ।",
            feature_music_title: "ਮੂਡ-ਆਧਾਰਿਤ ਸੰਗੀਤ",
            feature_music_desc: "ਕਿਊਰੇਟ ਕੀਤੀਆਂ ਪਲੇਲਿਸਟਾਂ ਜੋ ਤੁਹਾਡੀਆਂ ਮੌਜੂਦਾ ਭਾਵਨਾਤਮਕ ਲੋੜਾਂ ਅਨੁਸਾਰ ਢਲਦੀਆਂ ਹਨ।",
            feature_journal_title: "AI ਜਰਨਲਿੰਗ",
            feature_journal_desc: "ਨਿਰਦੇਸ਼ਿਤ ਪ੍ਰੋਂਪਟਾਂ ਅਤੇ ਭਾਵਨਾਤਮਕ ਫੀਡਬੈਕ ਦੇ ਨਾਲ ਆਪਣੇ ਦਿਨ 'ਤੇ ਵਿਚਾਰ ਕਰੋ।",
            feature_library_title: "ਸਰੋਤ ਲਾਇਬ੍ਰੇਰੀ",
            feature_library_desc: "ਮਾਨਸਿਕ ਸਿਹਤ ਲੇਖਾਂ ਅਤੇ ਵਰਕਸ਼ਾਪਾਂ ਦਾ ਵਿਆਪਕ ਸੰਗ੍ਰਹਿ।"
        }
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContent);

        // Merge namespaces
        Object.keys(newTranslations).forEach(namespace => {
            json[namespace] = {
                ...json[namespace],
                ...(newTranslations[namespace][lang] || newTranslations[namespace]['en'])
            };
        });

        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
        console.log(`Updated ${lang}/translation.json`);
    }
});
console.log("Phase 3 Translations merged successfully!");
