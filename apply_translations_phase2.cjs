const fs = require('fs');
const path = require('path');

const hiPath = path.join(__dirname, 'locales', 'hi', 'translation.json');
const paPath = path.join(__dirname, 'locales', 'pa', 'translation.json');
const enPath = path.join(__dirname, 'locales', 'en', 'translation.json');

const hiData = fs.existsSync(hiPath) ? JSON.parse(fs.readFileSync(hiPath, 'utf8')) : {};
const paData = fs.existsSync(paPath) ? JSON.parse(fs.readFileSync(paPath, 'utf8')) : {};
const enData = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf8')) : {};

const newTranslations = {
    meds: {
        title: { en: "Medications", hi: "दवाएं", pa: "ਦਵਾਈਆਂ" },
        subtitle: { en: "Log your medications and track your adherence.", hi: "अपनी दवाओं को लॉग करें और अपने पालन को ट्रैक करें।", pa: "ਆਪਣੀਆਂ ਦਵਾਈਆਂ ਨੂੰ ਲੌਗ ਕਰੋ ਅਤੇ ਆਪਣੇ ਪਾਲਣ ਨੂੰ ਟਰੈਕ ਕਰੋ।" },
        add: { en: "Add Medication", hi: "दवा जोड़ें", pa: "ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ" },
        notification: {
            title: { en: "Medication Reminder", hi: "दवा अनुस्मारक", pa: "ਦਵਾਈ ਰੀਮਾਈਂਡਰ" },
            body: { en: "It's time to take your {{name}} ({{dosage}}).", hi: "यह आपकी {{name}} ({{dosage}}) लेने का समय है।", pa: "ਇਹ ਤੁਹਾਡੀ {{name}} ({{dosage}}) ਲੈਣ ਦਾ ਸਮਾਂ ਹੈ।" }
        },
        notif_settings: { en: "Notification Settings", hi: "अधिसूचना सेटिंग्स", pa: "ਸੂਚਨਾ ਸੈਟਿੰਗਾਂ" },
        notif_enabled: { en: "Notifications are enabled.", hi: "सूचनाएं सक्षम हैं।", pa: "ਸੂਚਨਾਵਾਂ ਸਮਰੱਥ ਹਨ।" },
        notif_enable_btn: { en: "Enable Notifications", hi: "सूचनाएं सक्षम करें", pa: "ਸੂਚਨਾਵਾਂ ਸਮਰੱਥ ਕਰੋ" },
        notif_blocked: { en: "Notifications are blocked in your browser settings.", hi: "आपके ब्राउज़र सेटिंग्स में सूचनाएं अवरुद्ध हैं।", pa: "ਤੁਹਾਡੀਆਂ ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਸੂਚਨਾਵਾਂ ਬਲੌਕ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।" },
        progress_title: { en: "Today's Progress", hi: "आज की प्रगति", pa: "ਅੱਜ ਦੀ ਤਰੱਕੀ" },
        progress_desc: { en: "You've taken {{takenCount}} of {{totalCount}} medications today.", hi: "आज आपने {{totalCount}} में से {{takenCount}} दवाएं ली हैं।", pa: "ਤੁਸੀਂ ਅੱਜ {{totalCount}} ਵਿੱਚੋਂ {{takenCount}} ਦਵਾਈਆਂ ਲਈਆਂ ਹਨ।" },
        percent_complete: { en: "% Complete", hi: "% पूर्ण", pa: "% ਪੂਰਾ" },
        active_title: { en: "Your Active Medications", hi: "आपकी सक्रिय दवाएं", pa: "ਤੁਹਾਡੀਆਂ ਸਰਗਰਮ ਦਵਾਈਆਂ" },
        report_not_taking: { en: "Report Not Taking", hi: "रिपोर्ट न लेने की", pa: "ਰਿਪੋਰਟ ਨਾ ਲੈਣ ਦੀ" },
        loading: { en: "Loading medications...", hi: "दवाएं लोड हो रही हैं...", pa: "ਦਵਾਈਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ..." },
        mark_taken: { en: "Mark as Taken", hi: "लिया गया के रूप में चिह्नित करें", pa: "ਲਿਆ ਗਿਆ ਵਜੋਂ ਨਿਸ਼ਾਨਬੱਧ ਕਰੋ" },
        mark_not_taken: { en: "Mark as Not Taken", hi: "नहीं लिया गया के रूप में चिह्नित करें", pa: "ਨਹੀਂ ਲਿਆ ਗਿਆ ਵਜੋਂ ਨਿਸ਼ਾਨਬੱਧ ਕਰੋ" },
        no_active: { en: "No active medications added yet.", hi: "अभी तक कोई सक्रिय दवा नहीं जोड़ी गई है।", pa: "ਅਜੇ ਤੱਕ ਕੋਈ ਸਰਗਰਮ ਦਵਾਈ ਨਹੀਂ ਜੋੜੀ ਗਈ।" },
        inactive_title: { en: "Inactive Medications", hi: "निष्क्रिय दवाएं", pa: "ਅਕਿਰਿਆਸ਼ੀਲ ਦਵਾਈਆਂ" },
        inactive_desc: { en: "Medications you have reported you are no longer taking.", hi: "वे दवाएं जिन्हें आपने रिपोर्ट किया है कि आप अब नहीं ले रहे हैं।", pa: "ਉਹ ਦਵਾਈਆਂ ਜਿਨ੍ਹਾਂ ਦੀ ਤੁਸੀਂ ਰਿਪੋਰਟ ਕੀਤੀ ਹੈ ਕਿ ਤੁਸੀਂ ਹੁਣ ਨਹੀਂ ਲੈ ਰਹੇ ਹੋ।" },
        modals: {
            add_title: { en: "Add New Medication", hi: "नई दवा जोड़ें", pa: "ਨਵੀਂ ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ" },
            name: { en: "Medication Name", hi: "दवा का नाम", pa: "ਦਵਾਈ ਦਾ ਨਾਮ" },
            name_placeholder: { en: "e.g., Ibuprofen", hi: "उदा., इबुप्रोफेन", pa: "ਉਦਾਹਰਨ ਲਈ, ਇਬੂਪਰੋਫੇਨ" },
            dosage: { en: "Dosage", hi: "खुराक", pa: "ਖੁਰਾਕ" },
            dosage_placeholder: { en: "e.g., 200mg", hi: "उदा., 200mg", pa: "ਉਦਾਹਰਨ ਲਈ, 200mg" },
            freq: { en: "Frequency", hi: "आवृत्ति", pa: "ਆਵਿਰਤੀ" },
            freq_placeholder: { en: "e.g., Twice a day", hi: "उदा., दिन में दो बार", pa: "ਉਦਾਹਰਨ ਲਈ, ਦਿਨ ਵਿੱਚ ਦੋ ਵਾਰ" },
            times: { en: "Notification Times", hi: "अधिसूचना समय", pa: "ਸੂਚਨਾ ਸਮਾਂ" },
            enable_notifs: { en: "Enable notifications to receive alerts.", hi: "अलर्ट प्राप्त करने के लिए सूचनाएं सक्षम करें।", pa: "ਅਲਰਟ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸੂਚਨਾਵਾਂ ਨੂੰ ਸਮਰੱਥ ਬਣਾਓ।" },
            add_time: { en: "Add Time", hi: "समय जोड़ें", pa: "ਸਮਾਂ ਸ਼ਾਮਲ ਕਰੋ" },
            cancel: { en: "Cancel", hi: "रद्द करें", pa: "ਰੱਦ ਕਰੋ" },
            check_add: { en: "Check & Add", hi: "जांचें और जोड़ें", pa: "ਜਾਂਚ ਕਰੋ ਅਤੇ ਸ਼ਾਮਲ ਕਰੋ" }
        },
        report: {
            title: { en: "Report Medication", hi: "दवा की रिपोर्ट करें", pa: "ਦਵਾਈ ਦੀ ਰਿਪੋਰਟ ਕਰੋ" },
            choose: { en: "Which medication are you no longer taking?", hi: "आप अब कौन सी दवा नहीं ले रहे हैं?", pa: "ਤੁਸੀਂ ਹੁਣ ਕਿਹੜੀ ਦਵਾਈ ਨਹੀਂ ਲੈ ਰਹੇ ਹੋ?" },
            desc: { en: "This will move the medication to an inactive list. It will not be permanently deleted.", hi: "यह दवा को एक निष्क्रिय सूची में ले जाएगा। इसे स्थायी रूप से हटाया नहीं जाएगा।", pa: "ਇਹ ਦਵਾਈ ਨੂੰ ਅਕਿਰਿਆਸ਼ੀਲ ਸੂਚੀ ਵਿੱਚ ਲੈ ਜਾਵੇਗਾ। ਇਹ ਪੱਕੇ ਤੌਰ 'ਤੇ ਮਿਟਾਇਆ ਨਹੀਂ ਜਾਵੇਗਾ।" },
            confirm: { en: "Confirm", hi: "पुष्टि करें", pa: "ਪੁਸ਼ਟੀ ਕਰੋ" }
        },
        ai: {
            title: { en: "AI Interaction Check", hi: "एआई इंटरैक्शन जांच", pa: "ਏਆਈ ਇੰਟਰੈਕਸ਼ਨ ਜਾਂਚ" },
            checking: { en: "Checking for potential interactions...", hi: "संभावित इंटरैक्शन की जांच कर रहा है...", pa: "ਸੰਭਾਵੀ ਪਰਸਪਰ ਪ੍ਰਭਾਵ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ..." },
            warning_title: { en: "Potential Interaction Warning", hi: "संभावित इंटरैक्शन चेतावनी", pa: "ਸੰਭਾਵੀ ਇੰਟਰੈਕਸ਼ਨ ਚੇਤਾਵਨੀ" },
            disclaimer_title: { en: "Disclaimer:", hi: "अस्वीकरण:", pa: "ਬੇਦਾਅਵਾ:" },
            disclaimer_desc: { en: "This is an AI-generated analysis and not a substitute for professional medical advice. Please consult your doctor or pharmacist.", hi: "यह एआई-जनित विश्लेषण है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है। कृपया अपने डॉक्टर या फार्मासिस्ट से सलाह लें।", pa: "ਇਹ ਇੱਕ AI-ਉਤਪੰਨ ਵਿਸ਼ਲੇਸ਼ਣ ਹੈ ਅਤੇ ਪੇਸ਼ੇਵਰ ਡਾਕਟਰੀ ਸਲਾਹ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਡਾਕਟਰ ਜਾਂ ਫਾਰਮਾਸਿਸਟ ਨਾਲ ਸਲਾਹ ਕਰੋ।" },
            add_anyway: { en: "Add Anyway", hi: "वैसे भी जोड़ें", pa: "ਫਿਰ ਵੀ ਸ਼ਾਮਲ ਕਰੋ" }
        }
    },
    reminders: {
        title: { en: "Reminders & Alerts", hi: "अनुस्मारक और अलर्ट", pa: "ਰਿਮਾਈਂਡਰ ਅਤੇ ਅਲਰਟ" },
        subtitle: { en: "Stay on top of appointments, medication refills, and more.", hi: "अपॉइंटमेंट, दवा रिफिल, और अधिक पर नज़र रखें।", pa: "ਮੁਲਾਕਾਤਾਂ, ਦਵਾਈਆਂ ਦੇ ਰੀਫਿਲ, ਅਤੇ ਹੋਰ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ।" },
        new_reminder: { en: "New Reminder", hi: "नया अनुस्मारक", pa: "ਨਵਾਂ ਰੀਮਾਈਂਡਰ" },
        upcoming_title: { en: "Upcoming Reminders", hi: "आगामी अनुस्मारक", pa: "ਆਉਣ ਵਾਲੇ ਰੀਮਾਈਂਡਰ" },
        upcoming_count: { en: "You have {{count}} upcoming reminders.", hi: "आपके पास {{count}} आगामी अनुस्मारक हैं।", pa: "ਤੁਹਾਡੇ ਕੋਲ {{count}} ਆਉਣ ਵਾਲੇ ਰੀਮਾਈਂਡਰ ਹਨ।" },
        loading: { en: "Loading reminders...", hi: "अनुस्मारक लोड हो रहे हैं...", pa: "ਰੀਮਾਈਂਡਰ ਲੋਡ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ..." },
        no_reminders: { en: "No reminders set. Create one to get started.", hi: "कोई अनुस्मारक सेट नहीं है। आरंभ करने के लिए एक बनाएं।", pa: "ਕੋਈ ਰੀਮਾਈਂਡਰ ਸੈੱਟ ਨਹੀਂ ਕੀਤਾ ਗਿਆ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਇੱਕ ਬਣਾਓ।" },
        modals: {
            create_title: { en: "Create New Reminder", hi: "नया अनुस्मारक बनाएँ", pa: "ਨਵਾਂ ਰੀਮਾਈਂਡਰ ਬਣਾਓ" },
            title: { en: "Title", hi: "शीर्षक", pa: "ਸਿਰਲੇਖ" },
            title_placeholder: { en: "e.g., Doctor's Appointment", hi: "उदा., डॉक्टर की नियुक्ति", pa: "ਉਦਾਹਰਨ ਲਈ, ਡਾਕਟਰ ਦੀ ਮੁਲਾਕਾਤ" },
            date_time: { en: "Date & Time", hi: "दिनांक और समय", pa: "ਮਿਤੀ ਅਤੇ ਸਮਾਂ" },
            desc: { en: "Description (Optional)", hi: "विवरण (वैकल्पिक)", pa: "ਵਰਣਨ (ਵਿਕਲਪਿਕ)" },
            desc_placeholder: { en: "e.g., Annual check-up", hi: "उदा., वार्षिक जांच", pa: "ਉਦਾਹਰਨ ਲਈ, ਸਾਲਾਨਾ ਜਾਂਚ" },
            cancel: { en: "Cancel", hi: "रद्द करें", pa: "ਰੱਦ ਕਰੋ" },
            create_btn: { en: "Create Reminder", hi: "अनुस्मारक बनाएँ", pa: "ਰੀਮਾਈਂਡਰ ਬਣਾਓ" }
        }
    },
    appointments: {
        title: { en: "Appointment Manager", hi: "नियुक्ति प्रबंधक", pa: "ਨਿਯੁਕਤੀ ਪ੍ਰਬੰਧਕ" },
        subtitle: { en: "Keep track of your medical consultations and check-ups.", hi: "अपने चिकित्सा परामर्शों और जांचों पर नज़र रखें।", pa: "ਆਪਣੇ ਡਾਕਟਰੀ ਸਲਾਹ-ਮਸ਼ਵਰੇ ਅਤੇ ਜਾਂਚਾਂ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ।" },
        new: { en: "New Appointment", hi: "नई नियुक्ति", pa: "ਨਵੀਂ ਨਿਯੁਕਤੀ" },
        cancel_confirm: { en: "Are you sure you want to cancel this appointment?", hi: "क्या आप वाकई इस नियुक्ति को रद्द करना चाहते हैं?", pa: "ਕੀ ਤੁਸੀਂ ਯਕੀਨੀ ਹੋ ਕਿ ਤੁਸੀਂ ਇਸ ਨਿਯੁਕਤੀ ਨੂੰ ਰੱਦ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?" },
        upcoming_title: { en: "Upcoming Appointments", hi: "आगामी नियुक्तियां", pa: "ਆਉਣ ਵਾਲੀਆਂ ਨਿਯੁਕਤੀਆਂ" },
        upcoming_count: { en: "You have {{count}} upcoming appointments.", hi: "आपके पास {{count}} आगामी नियुक्तियां हैं।", pa: "ਤੁਹਾਡੇ ਕੋਲ {{count}} ਆਉਣ ਵਾਲੀਆਂ ਮੁਲਾਕਾਤਾਂ ਹਨ।" },
        loading: { en: "Loading appointments...", hi: "नियुक्तियां लोड हो रही हैं...", pa: "ਨਿਯੁਕਤੀਆਂ ਲੋਡ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ..." },
        with: { en: "with", hi: "के साथ", pa: "ਨਾਲ" },
        notes: { en: "Notes:", hi: "नोट्स:", pa: "ਨੋਟ:" },
        echeckin_complete: { en: "eCheck-in Complete!", hi: "ई-चेक-इन पूरा हुआ!", pa: "ਈ-ਚੈੱਕ-ਇਨ ਪੂਰਾ ਹੋਇਆ!" },
        echeckin: { en: "eCheck-In", hi: "ई-चेक-इन", pa: "ਈ-ਚੈੱਕ-ਇਨ" },
        join_video: { en: "Join Video Visit", hi: "वीडियो विजिट में शामिल हों", pa: "ਵੀਡੀਓ ਵਿਜ਼ਿਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ" },
        waitlist: { en: "Add to Waitlist", hi: "प्रतीक्षा सूची में जोड़ें", pa: "ਉਡੀਕ ਸੂਚੀ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ" },
        cancel: { en: "Cancel", hi: "रद्द करें", pa: "ਰੱਦ ਕਰੋ" },
        no_upcoming: { en: "No upcoming appointments. Schedule one to get started.", hi: "कोई आगामी नियुक्ति नहीं। शुरू करने के लिए एक शेड्यूल करें।", pa: "ਕੋਈ ਆਉਣ ਵਾਲੀ ਨਿਯੁਕਤੀ ਨਹੀਂ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਇੱਕ ਤਹਿ ਕਰੋ।" },
        past_title: { en: "Past Appointments", hi: "पिछली नियुक्तियाँ", pa: "ਪਿਛਲੀਆਂ ਨਿਯੁਕਤੀਆਂ" },
        past_count: { en: "You have {{count}} past appointments in your history.", hi: "आपके इतिहास में {{count}} पिछली नियुक्तियां हैं।", pa: "ਤੁਹਾਡੇ ਇਤਿਹਾਸ ਵਿੱਚ {{count}} ਪਿਛਲੀਆਂ ਮੁਲਾਕਾਤਾਂ ਹਨ।" },
        loading_history: { en: "Loading history...", hi: "इतिहास लोड हो रहा है...", pa: "ਇਤਿਹਾਸ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ..." },
        view_summary: { en: "View Summary", hi: "सारांश देखें", pa: "ਸੰਖੇਪ ਦੇਖੋ" },
        no_summary: { en: "No Summary Available", hi: "कोई सारांश उपलब्ध नहीं है", pa: "ਕੋਈ ਸੰਖੇਪ ਉਪਲਬਧ ਨਹੀਂ ਹੈ" },
        no_history: { en: "No appointment history yet.", hi: "अभी तक कोई नियुक्ति इतिहास नहीं है।", pa: "ਅਜੇ ਤੱਕ ਕੋਈ ਨਿਯੁਕਤੀ ਇਤਿਹਾਸ ਨਹੀਂ ਹੈ।" },
        modals: {
            add_title: { en: "Add New Appointment", hi: "नई नियुक्ति जोड़ें", pa: "ਨਵੀਂ ਨਿਯੁਕਤੀ ਸ਼ਾਮਲ ਕਰੋ" },
            visit_type: { en: "Visit Type", hi: "विजिट प्रकार", pa: "ਮੁਲਾਕਾਤ ਦੀ ਕਿਸਮ" },
            in_person: { en: "In-Person", hi: "व्यक्तिगत रूप से", pa: "ਵਿਅਕਤੀਗਤ ਰੂਪ ਵਿੱਚ" },
            video: { en: "Video", hi: "वीडियो", pa: "ਵੀਡੀਓ" },
            doc_name: { en: "Doctor's Name", hi: "डॉक्टर का नाम", pa: "ਡਾਕਟਰ ਦਾ ਨਾਮ" },
            doc_placeholder: { en: "e.g., Dr. Sharma", hi: "उदा., डॉ शर्मा", pa: "ਉਦਾਹਰਨ ਲਈ, ਡਾ. ਸ਼ਰਮਾ" },
            specialty: { en: "Specialty", hi: "विशेषज्ञता", pa: "ਵਿਸ਼ੇਸ਼ਤਾ" },
            spec_placeholder: { en: "e.g., Cardiologist", hi: "उदा., कार्डियोलॉजिस्ट", pa: "ਉਦਾਹਰਨ ਲਈ, ਕਾਰਡੀਓਲੋਜਿਸਟ" },
            datetime: { en: "Date & Time", hi: "दिनांक और समय", pa: "ਮਿਤੀ ਅਤੇ ਸਮਾਂ" },
            location: { en: "Location", hi: "स्थान", pa: "ਸਥਾਨ" },
            loc_placeholder: { en: "e.g., City Hospital, or 'Virtual'", hi: "उदा., सिटी अस्पताल, या 'वर्चुअल'", pa: "ਉਦਾਹਰਨ ਲਈ, ਸਿਟੀ ਹਸਪਤਾਲ, ਜਾਂ 'ਵਰਚੁਅਲ'" },
            notes: { en: "Notes / Questions for Doctor (Optional)", hi: "डॉक्टर के लिए नोट्स / प्रश्न (वैकल्पिक)", pa: "ਡਾਕਟਰ ਲਈ ਨੋਟ / ਸਵਾਲ (ਵਿਕਲਪਿਕ)" },
            notes_placeholder: { en: "e.g., Ask about new medication options", hi: "उदा., नए दवा विकल्पों के बारे में पूछें", pa: "ਉਦਾਹਰਨ ਲਈ, ਨਵੀਂ ਦਵਾਈ ਦੇ ਵਿਕਲਪਾਂ ਬਾਰੇ ਪੁੱਛੋ" },
            cancel: { en: "Cancel", hi: "रद्द करें", pa: "ਰੱਦ ਕਰੋ" },
            add_btn: { en: "Add Appointment", hi: "नियुक्ति जोड़ें", pa: "ਨਿਯੁਕਤੀ ਸ਼ਾਮਲ ਕਰੋ" },
            checkin_title: { en: "eCheck-In", hi: "ई-चेक-इन", pa: "ਈ-ਚੈੱਕ-ਇਨ" },
            checkin_desc: { en: "Save time at the clinic by completing your check-in now. Please verify your information and sign the consent form.", hi: "अपना चेक-इन अभी पूरा करके क्लिनिक में समय बचाएं। कृपया अपनी जानकारी सत्यापित करें और सहमति पत्र पर हस्ताक्षर करें।", pa: "ਆਪਣੇ ਚੈੱਕ-ਇਨ ਨੂੰ ਹੁਣੇ ਪੂਰਾ ਕਰਕੇ ਕਲੀਨਿਕ ਵਿੱਚ ਸਮਾਂ ਬਚਾਓ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਜਾਣਕਾਰੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸਹਿਮਤੀ ਫਾਰਮ 'ਤੇ ਦਸਤਖਤ ਕਰੋ।" },
            verify_info: { en: "Verify Information", hi: "जानकारी सत्यापित करें", pa: "ਜਾਣਕਾਰੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ" },
            name: { en: "Name:", hi: "नाम:", pa: "ਨਾਮ:" },
            dob: { en: "DOB: 01/01/1980 (mock)", hi: "जन्म तिथि: 01/01/1980 (मॉक)", pa: "DOB: 01/01/1980 (ਮੌਕ)" },
            consent: { en: "Consent to Treat", hi: "इलाज के लिए सहमति", pa: "ਇਲਾਜ ਲਈ ਸਹਿਮਤੀ" },
            consent_desc: { en: "I consent to treatment from the provider...", hi: "मैं प्रदाता से उपचार के लिए सहमति देता हूं...", pa: "ਮੈਂ ਪ੍ਰਦਾਤਾ ਤੋਂ ਇਲਾਜ ਲਈ ਸਹਿਮਤੀ ਦਿੰਦਾ ਹਾਂ..." },
            agree: { en: "I agree to the terms.", hi: "मैं शर्तों से सहमत हूं।", pa: "ਮੈਂ ਸ਼ਰਤਾਂ ਨਾਲ ਸਹਿਮਤ ਹਾਂ।" },
            complete_checkin: { en: "Complete Check-In", hi: "चेक-इन पूरा करें", pa: "ਚੈੱਕ-ਇਨ ਪੂਰਾ ਕਰੋ" },
            waitlist_title: { en: "Fast Pass Waitlist", hi: "फास्ट पास प्रतीक्षा सूची", pa: "ਫਾਸਟ ਪਾਸ ਉਡੀਕ ਸੂਚੀ" },
            waitlist_desc: { en: "You've been added to the waitlist! We will notify you via email if an earlier appointment slot becomes available.", hi: "आपको प्रतीक्षा सूची में जोड़ दिया गया है! यदि पहले की नियुक्ति का स्लॉट उपलब्ध हो जाता है तो हम आपको ईमेल के माध्यम से सूचित करेंगे।", pa: "ਤੁਹਾਨੂੰ ਉਡੀਕ ਸੂਚੀ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ! ਜੇਕਰ ਕੋਈ ਪੁਰਾਣੀ ਮੁਲਾਕਾਤ ਸਲਾਟ ਉਪਲਬਧ ਹੋ ਜਾਂਦਾ ਹੈ ਤਾਂ ਅਸੀਂ ਤੁਹਾਨੂੰ ਈਮੇਲ ਰਾਹੀਂ ਸੂਚਿਤ ਕਰਾਂਗੇ।" },
            ok: { en: "OK", hi: "ठीक है", pa: "ਠੀਕ ਹੈ" }
        }
    },
    find_care: {
        title: { en: "Find Care Now", hi: "अभी देखभाल खोजें", pa: "ਹੁਣ ਦੇਖਭਾਲ ਲੱਭੋ" },
        subtitle: { en: "Find real nearby Urgent Care or hospitals based on your location.", hi: "अपने स्थान के आधार पर वास्तविक नजदीकी तत्काल देखभाल या अस्पताल खोजें।", pa: "ਆਪਣੇ ਸਥਾਨ ਦੇ ਆਧਾਰ 'ਤੇ ਅਸਲ ਨਜ਼ਦੀਕੀ ਅਰਜੈਂਟ ਕੇਅਰ ਜਾਂ ਹਸਪਤਾਲ ਲੱਭੋ।" },
        unknown_med_center: { en: "Unknown Medical Center", hi: "अज्ञात चिकित्सा केंद्र", pa: "ਅਗਿਆਤ ਮੈਡੀਕਲ ਸੈਂਟਰ" },
        near_you: { en: "Location near you", hi: "आपके आस-पास का स्थान", pa: "ਤੁਹਾਡੇ ਨੇੜੇ ਸਥਾਨ" },
        toast_error: { en: "Failed to load real local clinics. Showing fallback map.", hi: "वास्तविक स्थानीय क्लीनिक लोड करने में विफल। फ़ॉलबैक मानचित्र दिखा रहा है।", pa: "ਅਸਲ ਸਥਾਨਕ ਕਲੀਨਿਕ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਫਾਲਬੈਕ ਨਕਸ਼ਾ ਦਿਖਾ ਰਿਹਾ ਹੈ।" },
        toast_warning: { en: "Could not get your location. Please ensure location permissions are granted.", hi: "आपका स्थान नहीं मिल सका. कृपया सुनिश्चित करें कि स्थान अनुमतियां दी गई हैं।", pa: "ਤੁਹਾਡਾ ਸਥਾਨ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਟਿਕਾਣਾ ਅਨੁਮਤੀਆਂ ਦਿੱਤੀਆਂ ਗਈਆਂ ਹਨ।" },
        toast_booking: { en: "Booking request sent to {{name}}. (Demo Feature)", hi: "{{name}} को बुकिंग अनुरोध भेजा गया। (डेमो फ़ीचर)", pa: "ਬੁਕਿੰਗ ਬੇਨਤੀ {{name}} ਨੂੰ ਭੇਜੀ ਗਈ। (ਡੈਮੋ ਵਿਸ਼ੇਸ਼ਤਾ)" },
        nearby_clinics: { en: "Nearby Clinics", hi: "आसपास के क्लीनिक", pa: "ਨੇੜਲੇ ਕਲੀਨਿਕ" },
        filter_all: { en: "All", hi: "सभी", pa: "ਸਾਰੇ" },
        filter_urgent: { en: "Urgent Care", hi: "तत्काल देखभाल", pa: "ਤੁਰੰਤ ਦੇਖਭਾਲ" },
        filter_er: { en: "ER", hi: "आपातकालीन", pa: "ਐਮਰਜੈਂਸੀ (ER)" },
        status_loading: { en: "Scanning area for clinics (Real-time GPS)", hi: "क्लीनिक के लिए क्षेत्र को स्कैन कर रहा है (रीयल-टाइम जीपीएस)", pa: "ਕਲੀਨਿਕਾਂ ਲਈ ਖੇਤਰ ਸਕੈਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ (ਰੀਅਲ-ਟਾਈਮ GPS)" },
        status_success: { en: "Showing {{count}} results near your real-time location.", hi: "आपके रीयल-टाइम स्थान के पास {{count}} परिणाम दिखा रहा है।", pa: "ਤੁਹਾਡੇ ਰੀਅਲ-ਟਾਈਮ ਟਿਕਾਣੇ ਦੇ ਨੇੜੇ {{count}} ਨਤੀਜੇ ਦਿਖਾ ਰਿਹਾ ਹੈ।" },
        status_error: { en: "Could not get your location. Please check browser permissions.", hi: "आपका स्थान नहीं मिल सका. कृपया ब्राउज़र अनुमतियां जांचें।", pa: "ਤੁਹਾਡਾ ਸਥਾਨ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਬ੍ਰਾਊਜ਼ਰ ਦੀਆਂ ਇਜਾਜ਼ਤਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।" },
        searching: { en: "Searching...", hi: "खोज रहा है...", pa: "ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ..." },
        min_wait: { en: "{{time}} min est. wait", hi: "{{time}} मिनट अनुमानित प्रतीक्षा", pa: "{{time}} ਮਿੰਟ ਅਨੁਮਾਨਿਤ ਉਡੀਕ" },
        distance_km: { en: "{{dist}} km", hi: "{{dist}} किमी", pa: "{{dist}} ਕਿ.ਮੀ" },
        google_rating: { en: "{{rating}} Google Rating", hi: "{{rating}} Google रेटिंग", pa: "{{rating}} Google ਰੇਟਿੰਗ" },
        book_btn: { en: "Book / Let them know I'm coming", hi: "बुक करें / उन्हें बताएं कि मैं आ रहा हूं", pa: "ਬੁੱਕ ਕਰੋ / ਉਹਨਾਂ ਨੂੰ ਦੱਸੋ ਕਿ ਮੈਂ ਆ ਰਿਹਾ ਹਾਂ" },
        no_clinics: { en: "No clinics found matching your filter right now.", hi: "अभी आपके फ़िल्टर से मेल खाने वाले कोई क्लीनिक नहीं मिले।", pa: "ਇਸ ਸਮੇਂ ਤੁਹਾਡੇ ਫਿਲਟਰ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਕਲੀਨਿਕ ਨਹੀਂ ਮਿਲਿਆ।" }
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

['meds', 'reminders', 'appointments', 'find_care'].forEach(mod => {
    hiData[mod] = hiData[mod] || {};
    paData[mod] = paData[mod] || {};
    enData[mod] = enData[mod] || {};
    assignTranslations(hiData[mod], newTranslations[mod], 'hi');
    assignTranslations(paData[mod], newTranslations[mod], 'pa');
    assignTranslations(enData[mod], newTranslations[mod], 'en');
});

fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 4));
fs.writeFileSync(paPath, JSON.stringify(paData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('Phase 2 Translations merged successfully!');
