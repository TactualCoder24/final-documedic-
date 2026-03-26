const fs = require('fs');
const path = require('path');

const hiPath = path.join(__dirname, 'locales', 'hi', 'translation.json');
const paPath = path.join(__dirname, 'locales', 'pa', 'translation.json');
const enPath = path.join(__dirname, 'locales', 'en', 'translation.json');

const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const paData = JSON.parse(fs.readFileSync(paPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const newTranslations = {
    landing: {
        get_started: { en: "Get Started", hi: "शुरू करें", pa: "ਸ਼ੁਰੂ ਕਰੋ" },
        trusted_badge: { en: "Trusted by many across India", hi: "भारत भर में कई लोगों द्वारा विश्वसनीय", pa: "ਭਾਰਤ ਭਰ ਵਿੱਚ ਕਈਆਂ ਦੁਆਰਾ ਭਰੋਸੇਯੋਗ" },
        grant_badge_long: { en: "₹1 Lakh Grant - Delhi Startup Yuva Festival", hi: "₹1 लाख अनुदान - दिल्ली स्टार्टअप युवा उत्सव", pa: "₹1 ਲੱਖ ਗ੍ਰਾਂਟ - ਦਿੱਲੀ ਸਟਾਰਟਅੱਪ ਯੁਵਾ ਫੈਸਟੀਵਲ" },
        grant_badge_short: { en: "₹1L Grant", hi: "₹1L अनुदान", pa: "₹1L ਗ੍ਰਾਂਟ" },
        title_start: { en: "Your Health,", hi: "आपका स्वास्थ्य,", pa: "ਤੁਹਾਡੀ ਸਿਹਤ," },
        title_end: { en: "Reimagined", hi: "नए रूप में", pa: "ਨਵੇਂ ਰੂप ਵਿੱਚ" },
        subtitle_start: { en: "The", hi: "एक", pa: "ਇੱਕ" },
        subtitle_bold: { en: "all-in-one platform", hi: "ऑल-इन-वन प्लेटफ़ॉर्म", pa: "ਆਲ-ਇਨ-ਵਨ ਪਲੇਟਫਾਰਮ" },
        subtitle_rest: { en: "that makes managing your health simple.", hi: "जो आपके स्वास्थ्य के प्रबंधन को सरल बनाता है।", pa: "ਜੋ ਤੁਹਾਡੀ ਸਿਹਤ ਦੇ ਪ੍ਰਬੰਧਨ ਨੂੰ ਸਰਲ ਬਣਾਉਂਦਾ ਹੈ।" },
        get_started_free: { en: "Get Started Free", hi: "मुफ़्त शुरू करें", pa: "ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ" },
        register_beta: { en: "Register for April", hi: "अप्रैल के लिए पंजीकरण करें", pa: "ਅਪ੍ਰੈਲ ਲਈ ਰਜਿਸਟਰ ਕਰੋ" },
        principles: {
            title_start: { en: "Your Health,", hi: "आपका स्वास्थ्य,", pa: "ਤੁਹਾਡੀ ਸਿਹਤ," },
            title_end: { en: "Your Data.", hi: "आपका डेटा।", pa: "ਤੁਹਾਡਾ ਡੇਟਾ।" },
            subtitle: { en: "We believe privacy matters.", hi: "हम मानते हैं कि गोपनीयता मायने रखती है।", pa: "ਅਸੀਂ ਮੰਨਦੇ ਹਾਂ ਕਿ ਗੋਪਨੀਯਤਾ ਮਹੱਤਵਪੂਰਨ ਹੈ।" },
            privacy: { title: { en: "Complete Privacy", hi: "पूर्ण गोपनीयता", pa: "ਪੂਰੀ ਗੋਪਨੀਯਤਾ" }, desc: { en: "Your data is yours.", hi: "आपका डेटा आपका है।", pa: "ਤੁਹਾਡਾ ਡੇਟਾ ਤੁਹਾਡਾ ਹੈ।" } },
            control: { title: { en: "You're In Control", hi: "आपका नियंत्रण", pa: "ਤੁਹਾਡਾ ਨਿਯੰਤਰਣ" }, desc: { en: "Manage what you share.", hi: "आप क्या साझा करते हैं, इसे प्रबंधित करें।", pa: "ਤੁਸੀਂ ਕੀ ਸਾਂਝਾ ਕਰਦੇ ਹੋ, ਇਸਦਾ ਪ੍ਰਬੰधन ਕਰੋ।" } },
            ai: { title: { en: "AI with Integrity", hi: "ईमानदारी के साथ एआई", pa: "ਇਮਾਨਦਾਰੀ ਨਾਲ AI" }, desc: { en: "Designed for personalization.", hi: "निजीकरण के लिए डिज़ाइन किया गया।", pa: "ਵਿਅਕਤੀਗਤਕਰਨ ਲਈ ਤਿਆਰ ਕੀਤਾ ਗਿਆ।" } }
        },
        how_it_works: {
            title_start: { en: "A ", hi: "एक ", pa: "ਇੱਕ " },
            title_gradient: { en: "Simpler Path", hi: "सरल मार्ग", pa: "ਸਰਲ ਮਾਰਗ" },
            title_end: { en: "to Health", hi: "स्वास्थ्य की ओर", pa: "ਸਿਹਤ ਵੱਲ" },
            subtitle: { en: "In three simple steps.", hi: "तीन सरल चरणों में।", pa: "ਤਿੰਨ ਸੌਖੇ ਕਦਮਾਂ ਵਿੱਚ।" },
            steps: {
                "Sign Up Securely": { title: { en: "Sign Up Securely", hi: "सुरक्षित साइन अप", pa: "ਸੁਰੱਖਿਅਤ ਸਾਈਨ ਅੱਪ" }, desc: { en: "Create your account.", hi: "अपना खाता बनाएं।", pa: "ਆਪਣਾ ਖਾਤਾ ਬਣਾਓ।" } },
                "Log Your Data": { title: { en: "Log Your Data", hi: "अपना डेटा दर्ज करें", pa: "ਆਪਣਾ ਡੇਟਾ ਲੌਗ ਕਰੋ" }, desc: { en: "Track medications.", hi: "दवाओं को ट्रैक करें।", pa: "ਦਵਾਈਆਂ ਨੂੰ ਟਰੈਕ ਕਰੋ।" } },
                "Gain Insights": { title: { en: "Gain Insights", hi: "अंतर्दृष्टि प्राप्त करें", pa: "ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ" }, desc: { en: "Receive smart summaries.", hi: "स्मार्ट सारांश प्राप्त करें।", pa: "ਸਮਾਰਟ ਸੰਖੇਪ ਪ੍ਰਾਪਤ ਕਰੋ।" } }
            }
        },
        features_section: {
            title_start: { en: "Everything You Need for", hi: "हर चीज जो आपको चाहिए", pa: "ਸਭ ਕੁਝ ਜੋ ਤੁਹਾਨੂੰ ਚਾਹੀਦਾ ਹੈ" },
            title_gradient: { en: "Better Health", hi: "बेहतर स्वास्थ्य", pa: "ਬਿਹਤਰ ਸਿਹਤ" },
            subtitle: { en: "DocuMedic empowers you.", hi: "DocuMedic आपको सशक्त बनाता है।", pa: "DocuMedic ਤੁਹਾਨੂੰ ਸ਼ਕਤੀ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।" }
        },
        features: {
            "Centralized Medical Records": { title: { en: "Centralized Records", hi: "केंद्रीकृत रिकॉर्ड", pa: "ਕੇਂਦਰੀਕ੍ਰਿਤ ਰਿਕਾਰਡ" }, desc: { en: "Store all reports.", hi: "सभी रिपोर्ट स्टोर करें।", pa: "ਸਾਰੀਆਂ ਰਿਪੋਰਟਾਂ ਸਟੋਰ ਕਰੋ।" } },
            "Medication Tracking": { title: { en: "Medication Tracking", hi: "दवा ट्रैकिंग", pa: "ਦਵਾਈ ਟਰੈਕਿੰਗ" }, desc: { en: "Log your medications.", hi: "अपनी दवाएं लॉग करें।", pa: "ਆਪਣੀਆਂ ਦਵਾਈਆਂ ਲੌਗ ਕਰੋ।" } },
            "Smart Health Summary": { title: { en: "Smart Health Summary", hi: "स्मार्ट स्वास्थ्य सारांश", pa: "ਸਮਾਰਟ ਸਿਹਤ ਸੰਖੇਪ" }, desc: { en: "AI-powered summary.", hi: "एआई-पावर्ड सारांश।", pa: "ਏਆਈ-ਸੰਚਾਲਿਤ ਸੰਖੇਪ।" } },
            "Secure Sharing": { title: { en: "Secure Sharing", hi: "सुरक्षित साझाकरण", pa: "ਸੁਰੱਖਿਅਤ ਸਾਂਝਾਕਰਨ" }, desc: { en: "Share with a link.", hi: "एक लिंक के साथ साझा करें।", pa: "ਇੱਕ ਲਿੰਕ ਨਾਲ ਸਾਂਝਾ ਕਰੋ।" } },
            "Custom Reminders": { title: { en: "Custom Reminders", hi: "कस्टम रिमाइंडर", pa: "ਕਸਟਮ ਰੀਮਾਈਂਡਰ" }, desc: { en: "Set personal alerts.", hi: "व्यक्तिगत अलर्ट सेट करें।", pa: "ਵਿਅਕਤੀਗत ਅਲਰਟ ਸੈਟ ਕਰੋ।" } },
            "AI-Powered Insights": { title: { en: "AI-Powered Insights", hi: "एआई इनसाइट्स", pa: "ਏਆਈ ਇਨਸਾਈਟਸ" }, desc: { en: "Personalized lifestyle tips.", hi: "व्यक्तिगत जीवन शैली युक्तियाँ।", pa: "ਵਿਅਕਤੀਗਤ ਜੀਵਨ ਸ਼ੈਲੀ ਸੁਝਾਅ।" } }
        },
        personas: {
            title: { en: "Built For Every Health Journey", hi: "हर स्वास्थ्य यात्रा के लिए", pa: "ਹਰ ਸਿਹਤ ਯਾਤਰਾ ਲਈ ਬਣਾਇਆ ਗਿਆ" },
            subtitle: { en: "Whether managing a condition.", hi: "चाहे स्थिति का प्रबंधन कर रहे हों।", pa: "ਭਾਵੇਂ ਸਥਿਤੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰ ਰਹੇ ਹੋ।" },
            "For the Caregiver": { title: { en: "For the Caregiver", hi: "देखभाल करने वाले के लिए", pa: "ਦੇਖਭਾਲ ਕਰਨ ਵਾਲੇ ਲਈ" }, desc: { en: "Manage loved ones.", hi: "प्रियजनों का प्रबंध करें।", pa: "ਅਜ਼ੀਜ਼ਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।" } },
            "For the Chronically Ill": { title: { en: "For Chronically Ill", hi: "गंभीर रूप से बीमार के लिए", pa: "ਗੰਭੀਰ ਰੂਪ ਤੋਂ ਬਿਮਾਰ ਲਈ" }, desc: { en: "Track vitals precisely.", hi: "वाइटल्स को ट्रैक करें।", pa: "ਵਿਟਲਸ ਨੂੰ ਟਰੈਕ ਕਰੋ।" } },
            "For the Health-Conscious": { title: { en: "Health-Conscious", hi: "स्वास्थ्य के प्रति जागरूक", pa: "ਸਿਹਤ ਪ੍ਰਤੀ ਸੁਚੇਤ" }, desc: { en: "Go beyond basic tracking.", hi: "बेसिक ट्रैकिंग से आगे जाएं।", pa: "ਬੁਨਿਆਦੀ ਟਰੈਕਿੰਗ ਤੋਂ ਅੱਗੇ ਜਾਓ।" } }
        },
        qr: {
            title: { en: "Emergency Access", hi: "आपातकालीन पहुँच", pa: "ਐਮਰਜੈਂਸੀ ਪਹੁੰਚ" },
            subtitle: { en: "Secure QR code.", hi: "सुरक्षित क्यूआर कोड।", pa: "ਸੁਰੱਖਿਅਤ ਕਯੂਆਰ ਕੋਡ।" },
            bullet_1: { en: "Generate unique code.", hi: "अद्वितीय कोड उत्पन्न करें।", pa: "ਵਿਲੱਖਣ ਕੋਡ ਤਿਆਰ ਕਰੋ।" },
            bullet_2: { en: "Share details.", hi: "विवरण साझा करें।", pa: "ਵੇਰਵੇ ਸਾਂਝੇ ਕਰੋ।" },
            bullet_3: { en: "You control sharing.", hi: "आप साझाकरण को नियंत्रित करते हैं।", pa: "ਤੁਸੀਂ ਸਾਂਝਾਕਰਨ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਦੇ ਹੋ।" }
        },
        testimonials: {
            title: { en: "Trusted by Users", hi: "उपयोगकर्ताओं द्वारा विश्वसनीय", pa: "ਉਪਭੋਗਤਾਵਾਂ ਦੁਆਰਾ ਭਰੋਸੇਯੋਗ" },
            subtitle: { en: "Hear what they say.", hi: "सुनें वे क्या कहते हैं।", pa: "ਸੁਣੋ ਉਹ ਕੀ ਕਹਿੰਦੇ ਹਨ।" }
        },
        security: {
            title: { en: "Privacy is Priority", hi: "गोपनीयता प्राथमिकता है", pa: "ਗੋਪਨੀਯਤਾ ਪ੍ਰਾਥਮਿਕਤਾ ਹੈ" },
            subtitle: { en: "Highest standard of security.", hi: "सुरक्षा का उच्चतम मानक।", pa: "ਸੁਰੱਖਿਆ ਦਾ ਸਰਵਉੱਚ ਮਿਆਰ।" },
            features: {
                "Secure Authentication": { title: { en: "Secure Auth", hi: "सुरक्षित प्रमाणीकरण", pa: "ਸੁਰੱਖਿਅਤ ਪ੍ਰਮਾਣਿਕਤਾ" }, desc: { en: "Powered by Google.", hi: "Google द्वारा संचालित।", pa: "Google ਦੁਆਰਾ ਸੰਚਾਲਿਤ।" } },
                "You're In Control": { title: { en: "In Control", hi: "नियंत्रण में", pa: "ਨਿਯੰਤਰਣ ਵਿੱਚ" }, desc: { en: "You own your data.", hi: "आपका डेटा आपका है।", pa: "ਤੁਹਾਡਾ ਡੇਟਾ ਤੁਹਾਡਾ ਹੈ।" } },
                "End-to-End Encryption": { title: { en: "Encrypted", hi: "एन्क्रिप्टेड", pa: "ਇਨਕ੍ਰਿਪਟਡ" }, desc: { en: "Data remains private.", hi: "डेटा निजी रहता है।", pa: "ਡੇਟਾ ਨਿੱਜੀ ਰਹਿੰਦਾ ਹੈ।" } }
            }
        },
        cta: {
            title: { en: "Ready to Take Control?", hi: "नियंत्रण लेने के लिए तैयार हैं?", pa: "ਨਿਯੰਤਰਣ ਲੈਣ ਲਈ ਤਿਆਰ ਹੋ?" },
            subtitle: { en: "Join thousands of others.", hi: "हजारों अन्य लोगों से जुड़ें।", pa: "ਹਜ਼ਾਰਾਂ ਹੋਰਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।" },
            button: { en: "Get Started for Free", hi: "मुफ़्त में शुरू करें", pa: "ਮੁਫ਼ਤ ਵਿੱਚ ਸ਼ੁਰੂ ਕਰੋ" }
        },
        footer: {
            mission: { en: "Empowering your health journey.", hi: "आपके स्वास्थ्य यात्रा को मजबूत बनाना।", pa: "ਤੁਹਾਡੀ ਸਿਹਤ ਯਾਤਰਾ ਨੂੰ ਮਜ਼ਬੂਤ ਬਣਾਉਣਾ।" },
            made_with_love: { en: "Made with love in Delhi", hi: "दिल्ली में प्यार से बनाया गया", pa: "ਦਿੱਲੀ ਵਿੱਚ ਪਿਆਰ ਨਾਲ ਬਣਾਇਆ ਗਿਆ" },
            quick_links: { en: "Quick Links", hi: "त्वरित लिंक्स", pa: "ਤੁਰੰਤ ਲਿੰਕ" },
            features: { en: "Features", hi: "विशेषताएं", pa: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ" },
            who_its_for: { en: "Who It's For", hi: "यह किसके लिए है", pa: "ਇਹ ਕਿਸਦੇ ਲਈ ਹੈ" },
            security: { en: "Security", hi: "सुरक्षा", pa: "ਸੁਰੱਖਿਆ" },
            legal: { en: "Legal", hi: "कानूनी", pa: "ਕਾਨੂੰਨੀ" },
            privacy: { en: "Privacy Policy", hi: "गोपनीयता नीति", pa: "ਗੋਪਨੀਯਤਾ ਨੀਤੀ" },
            terms: { en: "Terms of Service", hi: "सेवा की शर्तें", pa: "ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ" },
            rights_reserved: { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।", pa: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ।" }
        }
    },
    onboarding: {
        welcome: {
            title_start: { en: "Welcome to", hi: "में आपका स्वागत है", pa: "ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ" },
            subtitle_pre: { en: "Customize dashboard in", hi: "डैशबोर्ड को कस्टमाइज़ करें", pa: "ਡੈਸ਼ਬੋਰਡ ਨੂੰ ਅਨੁਕੂਲਿਤ ਕਰੋ" },
            subtitle_bold: { en: "60 seconds", hi: "60 सेकंड", pa: "60 ਸਕਿੰਟ" },
            subtitle_post: { en: "before signup.", hi: "साइनअप से पहले।", pa: "ਸਾਈनਅੱਪ ਤੋਂ ਪਹਿਲਾਂ।" },
            language: { en: "App Language", hi: "ऐप की भाषा", pa: "ਐਪ ਦੀ ਭਾਸ਼ਾ" },
            private: { en: "Private & Secure", hi: "निजी और सुरक्षित", pa: "ਨਿੱਜੀ ਅਤੇ ਸੁਰੱਖਿਅਤ" },
            fast: { en: "Takes 60 seconds", hi: "60 सेकंड लगते हैं", pa: "60 ਸਕਿੰਟ ਲੱਗਦੇ ਹਨ" }
        },
        profile: {
            title: { en: "Your Health Profile", hi: "आपका स्वास्थ्य प्रोफ़ाइल", pa: "ਤੁਹਾਡੀ ਸਿਹਤ ਪ੍ਰੋਫਾਈਲ" },
            subtitle: { en: "Basic info", hi: "बुनियादी जानकारी", pa: "ਮੁਢਲੀ ਜਾਣਕਾਰੀ" },
            age: { en: "Your Age", hi: "आपकी आयु", pa: "ਤੁਹਾਡੀ ਉਮਰ" },
            blood_type: { en: "Blood Type", hi: "रक्त का प्रकार", pa: "ਖੂਨ ਦੀ ਕਿਸਮ" },
            blood_select: { en: "Select blood type", hi: "रक्त प्रकार चुनें", pa: "ਖੂਨ ਦੀ ਕਿਸਮ ਚੁਣੋ" },
            blood_sugar: { en: "Blood Sugar", hi: "ब्लड शुगर", pa: "ਬਲੱਡ ਸ਼ੂਗਰ" },
            blood_pressure: { en: "Blood Pressure", hi: "रक्तचाप", pa: "ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ" }
        },
        meds: {
            title: { en: "Your Medications", hi: "आपकी दवाएं", pa: "ਤੁਹਾਡੀਆਂ ਦਵਾਈਆਂ" },
            subtitle: { en: "Select current meds", hi: "वर्तमान दवाएं चुनें", pa: "ਮੌਜੂਦਾ ਦਵਾਈਆਂ ਚੁਣੋ" },
            none: { en: "None / Not Needed", hi: "कोई नहीं / जरूरत नहीं है", pa: "ਕੋਈ ਨਹੀਂ / ਲੋੜ ਨਹੀਂ ਹੈ" },
            add: { en: "Add another", hi: "एक और जोड़ें", pa: "ਇੱਕ ਹੋਰ ਸ਼ਾਮਲ ਕਰੋ" },
            placeholder: { en: "Type a medication name...", hi: "दवा का नाम टाइप करें...", pa: "ਦਵਾਈ ਦਾ ਨਾਮ ਟਾਈਪ ਕਰੋ..." },
            press_enter: { en: "Press enter to add", hi: "जोड़ने के लिए एंटर दबाएं", pa: "ਸ਼ਾਮਲ ਕਰਨ ਲਈ ਐਂਟਰ ਦਬਾਓ" }
        },
        goals: {
            title: { en: "Your Health Goals", hi: "आपके स्वास्थ्य लक्ष्य", pa: "ਤੁਹਾਡੇ ਸਿਹਤ ਟੀਚੇ" },
            subtitle: { en: "What to achieve?", hi: "क्या हासिल करना है?", pa: "ਕੀ ਪ੍ਰਾਪਤ ਕਰਨਾ ਹੈ?" },
            water_goal: { en: "Daily Water Goal", hi: "दैनिक जल लक्ष्य", pa: "ਰੋਜ਼ਾਨਾ ਪਾਣੀ ਦਾ ਟੀਚਾ" },
            items: {
                "lower_bp": { en: "Lower blood pressure", hi: "रक्तचाप कम करें", pa: "ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਘਟਾਓ" },
                "manage_sugar": { en: "Manage blood sugar", hi: "ब्लड शुगर प्रबंधित करें", pa: "ਬਲੱਡ ਸ਼ੂਗਰ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ" },
                "lose_weight": { en: "Lose weight", hi: "वजन कम करें", pa: "ਭਾਰ ਘਟਾਓ" },
                "stay_hydrated": { en: "Stay hydrated", hi: "हाइड्रेटेड रहें", pa: "ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ" },
                "better_sleep": { en: "Sleep better", hi: "बेहतर नींद लें", pa: "ਬਿਹਤਰ ਨੀਂਦ ਲਓ" },
                "reduce_stress": { en: "Reduce stress", hi: "तनाव कम करें", pa: "ਤਣਾਅ ਘਟਾਓ" },
                "eat_healthy": { en: "Eat healthier", hi: "स्वस्थ खाएं", pa: "ਸਿਹਤਮੰਦ ਖਾਓ" },
                "exercise_more": { en: "Exercise regularly", hi: "नियमित व्यायाम करें", pa: "ਨਿਯਮਿਤ ਕਸਰਤ ਕਰੋ" }
            }
        },
        complete: {
            title: { en: "Your Profile is Ready!", hi: "आपका प्रोफ़ाइल तैयार है!", pa: "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਤਿਆਰ ਹੈ!" },
            subtitle: { en: "Create a free account.", hi: "एक मुफ़्त खाता बनाएँ।", pa: "ਇੱਕ ਮੁਫ਼ਤ ਖਾਤਾ ਬਣਾਓ।" },
            saved_msg: { en: "We temporarily saved your choices.", hi: "हमने आपके विकल्प सहेजे हैं।", pa: "ਅਸੀਂ ਤੁਹਾਡੀਆਂ ਚੋਣਾਂ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਹੈ।" },
            signup_prompt: { en: "Sign up to not lose them!", hi: "इन्हें न खोने के लिए साइन अप करें!", pa: "ਇਹਨਾਂ ਨੂੰ ਨਾ ਗੁਆਉਣ ਲਈ ਸਾਈਨ ਅੱਪ ਕਰੋ!" }
        },
        actions: {
            skip: { en: "Skip Setup", hi: "सेटअप छोड़ें", pa: "ਸੈੱਟਅੱਪ ਛੱਡੋ" },
            back: { en: "Back", hi: "पीछे", pa: "ਪਿੱਛੇ" },
            continue: { en: "Continue", hi: "जारी रखें", pa: "ਜਾਰੀ ਰੱਖੋ" },
            signup: { en: "Sign Up / Log In", hi: "साइन अप / लॉग इन करें", pa: "ਸਾਈਨ ਅੱਪ / ਲੌਗ ਇਨ ਕਰੋ" }
        }
    }
};

function assignTranslations(data, obj, lang) {
    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && value.en) {
            data[key] = value[lang];
        } else if (value && typeof value === 'object') {
            data[key] = data[key] || {};
            assignTranslations(data[key], value, lang);
        }
    }
}

hiData.landing = hiData.landing || {};
hiData.onboarding = hiData.onboarding || {};
paData.landing = paData.landing || {};
paData.onboarding = paData.onboarding || {};
enData.landing = enData.landing || {};
enData.onboarding = enData.onboarding || {};

assignTranslations(hiData.landing, newTranslations.landing, 'hi');
assignTranslations(hiData.onboarding, newTranslations.onboarding, 'hi');
assignTranslations(paData.landing, newTranslations.landing, 'pa');
assignTranslations(paData.onboarding, newTranslations.onboarding, 'pa');
assignTranslations(enData.landing, newTranslations.landing, 'en');
assignTranslations(enData.onboarding, newTranslations.onboarding, 'en');

fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 4));
fs.writeFileSync(paPath, JSON.stringify(paData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('Translations merged successfully!');
