import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const languages = [
  // 1. Regional & Jharkhand Indigenous Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ / संताली', flag: '🇮🇳', category: 'regional', gtCode: 'sat' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳', category: 'regional', gtCode: 'bho' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳', category: 'regional', gtCode: 'mai' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', category: 'regional', gtCode: 'bn' },
  { code: 'hoc', name: 'Ho', nativeName: 'ᱦᱳ (Ho)', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },
  { code: 'unr', name: 'Mundari', nativeName: 'मुंडारी (Mundari)', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },
  { code: 'kru', name: 'Kurukh / Oraon', nativeName: 'कुड़ुख़ (Kurukh)', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },
  { code: 'khr', name: 'Kharia', nativeName: 'खड़िया (Kharia)', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },
  { code: 'sck', name: 'Nagpuri / Sadri', nativeName: 'नागपुरी / सादरी', flag: '🇮🇳', category: 'regional', gtCode: 'hi' },

  // 2. Major Scheduled & National Indian Languages
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', category: 'national', gtCode: 'mr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', category: 'national', gtCode: 'te' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', category: 'national', gtCode: 'ta' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', category: 'national', gtCode: 'gu' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', category: 'national', gtCode: 'ur' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', category: 'national', gtCode: 'kn' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', category: 'national', gtCode: 'or' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', category: 'national', gtCode: 'ml' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', category: 'national', gtCode: 'pa' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', category: 'national', gtCode: 'as' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳', category: 'national', gtCode: 'sa' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', category: 'national', gtCode: 'ne' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी / سنڌي', flag: '🇮🇳', category: 'national', gtCode: 'sd' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳', category: 'national', gtCode: 'gom' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳', category: 'national', gtCode: 'doi' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', flag: '🇮🇳', category: 'national', gtCode: 'mni-Mtei' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', flag: '🇮🇳', category: 'national', gtCode: 'brx' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कश्मीरी', flag: '🇮🇳', category: 'national', gtCode: 'ks' },

  // 3. International Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', category: 'international', gtCode: 'en' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', category: 'international', gtCode: 'es' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', category: 'international', gtCode: 'fr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', category: 'international', gtCode: 'de' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', category: 'international', gtCode: 'ar' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', category: 'international', gtCode: 'ru' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', category: 'international', gtCode: 'ja' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', category: 'international', gtCode: 'zh-CN' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', category: 'international', gtCode: 'pt' },
];

export const translations = {
  en: {
    brand_name: 'JanSetu',
    govt_title: 'Govt. of Jharkhand',
    state_innovation_network: 'State Innovation & Collaboration Network',
    university_portal: 'University Academic Hub',
    citizen_portal: 'Citizen Grievance Portal',
    industry_portal: 'Industry & CSR Portal',
    admin_portal: 'State Admin AI Console',
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_challenges: 'Civic Challenges',
    nav_projects: 'Active Projects',
    nav_proposals: 'R&D Proposals',
    nav_teams: 'Lab Teams',
    nav_milestones: 'Milestones & SLA',
    nav_communication: 'Communication Hub',
    nav_documents: 'Documents Vault',
    nav_industry: 'Industry & CSR',
    nav_impact: 'Impact & Metrics',
    nav_profile: 'Profile',
    nav_report_problem: 'Report Grievance',
    nav_my_problems: 'My Track Record',
    nav_public_map: 'Problem Map',
    nav_solutions: 'Solutions Directory',
    nav_public_challenges: 'Public Challenges',
    nav_collaborations: 'Collaboration Requests',
    nav_bounties: 'Problems & Bounties',
    nav_logout: 'Log Out',
    nav_login: 'Login / Gateway',
    uni_dash_title: 'University R&D Dashboard',
    uni_dash_subtitle: 'Overview of assigned challenges, active projects and industry collaborations.',
    kpi_assigned_challenges: 'Assigned Challenges',
    kpi_active_projects: 'Active Projects',
    kpi_pending_actions: 'Pending Actions',
    kpi_industry_collabs: 'Industry Collaborations',
    kpi_state_matched: 'State Matched',
    kpi_accepted_active: 'Accepted & Active',
    kpi_review_needed: 'Review Needed',
    kpi_active_mous: 'Active MOUs',
    search_placeholder: 'Search challenges, projects, grants, faculty...',
    notifications: 'Notifications',
    mark_all_read: 'Mark all as read',
    no_notifications: 'No notifications at this time.',
    language_select: 'Language',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    loading: 'Loading...',
    submit: 'Submit',
    report_new_grievance: 'Report a Civic Problem',
    filter_by: 'Filter by',
    status: 'Status',
    priority: 'Priority',
    category: 'Category',
    location: 'Location',
    view_details: 'View Details',
    take_action: 'Take Action',
    empty_no_problems: 'No problems reported yet. Click Report Grievance to submit your first issue.',
    empty_no_projects: 'No active projects yet. Submit an R&D proposal to begin.',
    empty_no_collabs: 'No active collaborations yet.'
  },
  hi: {
    brand_name: 'जनसेतु',
    govt_title: 'झारखंड सरकार',
    state_innovation_network: 'राज्य नवाचार एवं सहयोग नेटवर्क',
    university_portal: 'विश्वविद्यालय शैक्षणिक केंद्र',
    citizen_portal: 'नागरिक शिकायत समाधान पोर्टल',
    industry_portal: 'उद्योग एवं सीएसआर पोर्टल',
    admin_portal: 'राज्य प्रशासन एआई कंसोल',
    nav_home: 'होम',
    nav_dashboard: 'डैशबोर्ड',
    nav_challenges: 'नागरिक चुनौतियाँ',
    nav_projects: 'सक्रिय अनुसंधान परियोजनाएँ',
    nav_proposals: 'आरएंडडी प्रस्ताव',
    nav_teams: 'प्रयोगशाला दल',
    nav_milestones: 'मील के पत्थर व एसएलए',
    nav_communication: 'संवाद केंद्र',
    nav_documents: 'दस्तावेज़ वॉल्ट',
    nav_industry: 'उद्योग एवं सीएसआर',
    nav_impact: 'प्रभाव एवं मेट्रिक्स',
    nav_profile: 'प्रोफ़ाइल',
    nav_report_problem: 'समस्या दर्ज करें',
    nav_my_problems: 'मेरा ट्रैक रिकॉर्ड',
    nav_public_map: 'समस्या मानचित्र',
    nav_solutions: 'समाधान निर्देशिका',
    nav_public_challenges: 'सार्वजनिक चुनौतियाँ',
    nav_collaborations: 'सहयोग अनुरोध',
    nav_bounties: 'समस्याएं और पुरस्कार',
    nav_logout: 'लॉग आउट',
    nav_login: 'लॉगिन / प्रवेश द्वार',
    uni_dash_title: 'विश्वविद्यालय अनुसंधान डैशबोर्ड',
    uni_dash_subtitle: 'सौंपी गई चुनौतियों, सक्रिय परियोजनाओं और उद्योग सहयोग का समग्र अवलोकन।',
    kpi_assigned_challenges: 'आवंटित चुनौतियाँ',
    kpi_active_projects: 'सक्रिय परियोजनाएँ',
    kpi_pending_actions: 'लंबित कार्रवाइयां',
    kpi_industry_collabs: 'उद्योग सहयोग',
    kpi_state_matched: 'राज्य द्वारा मिलान',
    kpi_accepted_active: 'स्वीकृत एवं सक्रिय',
    kpi_review_needed: 'समीक्षा आवश्यक',
    kpi_active_mous: 'सक्रिय सहमति पत्र (MOU)',
    search_placeholder: 'चुनौतियाँ, परियोजनाएँ, अनुदान, संकाय खोजें...',
    notifications: 'सूचनाएं',
    mark_all_read: 'सभी को पढ़ा हुआ चिह्नित करें',
    no_notifications: 'इस समय कोई नई सूचना नहीं है।',
    language_select: 'भाषा चुनें',
    close: 'बंद करें',
    cancel: 'रद्द करें',
    save: 'परिवर्तन सहेजें',
    loading: 'लोड हो रहा है...',
    submit: 'जमा करें',
    report_new_grievance: 'नागरिक समस्या दर्ज करें',
    filter_by: 'फ़िल्टर करें',
    status: 'स्थिति',
    priority: 'प्राथमिकता',
    category: 'श्रेणी',
    location: 'स्थान',
    view_details: 'विवरण देखें',
    take_action: 'कार्रवाई करें',
    empty_no_problems: 'अभी तक कोई समस्या दर्ज नहीं हुई है। पहली समस्या दर्ज करने के लिए "समस्या दर्ज करें" पर क्लिक करें।',
    empty_no_projects: 'अभी तक कोई सक्रिय परियोजना नहीं है। शुरू करने के लिए अनुसंधान प्रस्ताव जमा करें।',
    empty_no_collabs: 'अभी तक कोई सक्रिय सहयोग नहीं है।'
  },
  bn: {
    brand_name: 'জনসেতু',
    govt_title: 'ঝাড়খণ্ড সরকার',
    state_innovation_network: 'রাজ্য উদ্ভাবন ও সহযোগিতা নেটওয়ার্ক',
    university_portal: 'বিশ্ববিদ্যালয় একাডেমিক হাব',
    citizen_portal: 'নাগরিক অভিযোগ পোর্টাল',
    industry_portal: 'শিল্প ও সিএসআর পোর্টাল',
    admin_portal: 'রাজ্য প্রশাসন এআই কনসোল',
    nav_home: 'হোম',
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_challenges: 'নাগরিক চ্যালেঞ্জসমূহ',
    nav_projects: 'সক্রিয় প্রকল্পসমূহ',
    nav_proposals: 'গবেষণা প্রস্তাব',
    nav_teams: 'গবেষণাগার দল',
    nav_milestones: 'মাইলফলক ও এসএলএ',
    nav_communication: 'যোগাযোগ কেন্দ্র',
    nav_documents: 'নথিপত্র ভল্ট',
    nav_industry: 'শিল্প ও সিএসআর',
    nav_impact: 'প্রভাব ও মেট্রিক্স',
    nav_profile: 'প্রোফাইল',
    nav_report_problem: 'সমস্যা রিপোর্ট করুন',
    nav_my_problems: 'আমার ট্র্যাক রেকর্ড',
    nav_public_map: 'সমস্যা মানচিত্র',
    nav_solutions: 'সমাধান ডিরেক্টরি',
    nav_public_challenges: 'পাবলিক চ্যালেঞ্জ',
    nav_collaborations: 'সহযোগিতার অনুরোধ',
    nav_bounties: 'সমস্যা ও পুরস্কার',
    nav_logout: 'সাইন আউট',
    nav_login: 'লগইন / প্রবেশদ্বার',
    uni_dash_title: 'বিশ্ববিদ্যালয় গবেষণা ড্যাশবোর্ড',
    uni_dash_subtitle: 'বরাদ্দকৃত চ্যালেঞ্জ, সক্রিয় প্রকল্প এবং শিল্প সহযোগিতার সামগ্রিক বিবরণ।',
    kpi_assigned_challenges: 'বরাদ্দকৃত চ্যালেঞ্জ',
    kpi_active_projects: 'বিশ্ববিদ্যালয়ের সক্রিয় প্রকল্প',
    kpi_pending_actions: 'মুলতুবি পদক্ষেপ',
    kpi_industry_collabs: 'শিল্প সহযোগিতা',
    kpi_state_matched: 'রাজ্য দ্বারা সমন্বিত',
    kpi_accepted_active: 'গৃহীত ও সক্রিয়',
    kpi_review_needed: 'পর্যালোচনা প্রয়োজন',
    kpi_active_mous: 'সক্রিয় সমঝোতা স্মারক (MOU)',
    search_placeholder: 'চ্যালেঞ্জ, প্রকল্প, অনুদান খুঁজুন...',
    notifications: 'বিজ্ঞপ্তি',
    mark_all_read: 'সব পঠিত হিসেবে চিহ্নিত করুন',
    no_notifications: 'কোনো নতুন বিজ্ঞপ্তি নেই।',
    language_select: 'ভাষা নির্বাচন করুন',
    close: 'বন্ধ করুন',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ করুন',
    loading: 'লোড হচ্ছে...',
    submit: 'জমা দিন',
    report_new_grievance: 'নাগরিক সমস্যা রিপোর্ট করুন',
    filter_by: 'ফিল্টার করুন',
    status: 'অবস্থা',
    priority: 'অগ্রাধিকার',
    category: 'বিভাগ',
    location: 'অবস্থান',
    view_details: 'বিস্তারিত দেখুন',
    take_action: 'পদক্ষেপ নিন',
    empty_no_problems: 'এখনও কোনো সমস্যা রিপোর্ট করা হয়নি।',
    empty_no_projects: 'এখনও কোনো সক্রিয় প্রকল্প নেই।',
    empty_no_collabs: 'এখনও কোনো সক্রিয় সহযোগিতা নেই।'
  },
  sat: {
    brand_name: 'JanSetu (ᱡᱚᱱᱥᱮᱛᱩ)',
    govt_title: 'झारखंड सरकार (Jharkhand Sarkar)',
    state_innovation_network: 'State Innovation & Collaboration Network',
    university_portal: 'University Academic Hub (ᱥᱮᱪᱮᱫ ᱦᱟᱵᱽ)',
    citizen_portal: 'Citizen Grievance Portal (ᱱᱟᱜᱟᱨᱤᱠ ᱯᱳᱨᱴᱟᱞ)',
    industry_portal: 'Industry & CSR Portal',
    admin_portal: 'State Admin AI Console',
    nav_home: 'Home (ᱚᱲᱟᱜ)',
    nav_dashboard: 'Dashboard (ᱰᱮᱥᱵᱳᱨᱰ)',
    nav_challenges: 'Civic Challenges (ᱮᱴᱠᱮᱴᱚᱬᱮ)',
    nav_projects: 'Active Projects (ᱠᱟᱹᱢᱤᱦᱚᱨᱟ)',
    nav_proposals: 'R&D Proposals',
    nav_teams: 'Lab Teams',
    nav_milestones: 'Milestones & SLA',
    nav_communication: 'Communication Hub',
    nav_documents: 'Documents Vault',
    nav_industry: 'Industry & CSR',
    nav_impact: 'Impact & Metrics',
    nav_profile: 'Profile',
    nav_report_problem: 'Report Grievance (ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ)',
    nav_my_problems: 'My Track Record',
    nav_public_map: 'Problem Map',
    nav_solutions: 'Solutions Directory',
    nav_public_challenges: 'Public Challenges',
    nav_collaborations: 'Collaboration Requests',
    nav_bounties: 'Problems & Bounties',
    nav_logout: 'Sign Out (ᱚᱰᱚᱠᱚᱜ)',
    nav_login: 'Login / Gateway',
    uni_dash_title: 'University R&D Dashboard (ᱥᱮᱪᱮᱫ ᱰᱮᱥᱵᱳᱨᱰ)',
    uni_dash_subtitle: 'Overview of assigned challenges and collaborations.',
    kpi_assigned_challenges: 'Assigned Challenges',
    kpi_active_projects: 'Active Projects',
    kpi_pending_actions: 'Pending Actions',
    kpi_industry_collabs: 'Industry Collaborations',
    search_placeholder: 'Search challenges, projects...',
    notifications: 'Notifications',
    mark_all_read: 'Mark all as read',
    no_notifications: 'No notifications at this time.',
    language_select: 'Language (ᱯᱟᱹᱨᱥᱤ)',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    loading: 'Loading...',
    submit: 'Submit (ᱡᱚᱢᱟ ᱢᱮ)',
    report_new_grievance: 'Report Problem (ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ)',
    empty_no_problems: 'No problems reported yet.',
    empty_no_projects: 'No active projects yet.',
    empty_no_collabs: 'No active collaborations yet.'
  },
  bho: {
    brand_name: 'जनसेतु',
    govt_title: 'झारखंड सरकार',
    state_innovation_network: 'राज्य नवाचार आ सहयोग नेटवर्क',
    university_portal: 'विश्वविद्यालय केंद्र',
    citizen_portal: 'नागरिक समस्या समाधान पोर्टल',
    industry_portal: 'उद्योग आ सीएसआर पोर्टल',
    admin_portal: 'प्रशासन एआई कंसोल',
    nav_home: 'घर (Home)',
    nav_dashboard: 'डैशबोर्ड',
    nav_challenges: 'नागरिक चुनौती',
    nav_projects: 'चालू प्रोजेक्ट',
    nav_proposals: 'अनुसंधान प्रस्ताव',
    nav_teams: 'लैब टीम',
    nav_milestones: 'मील का पत्थर',
    nav_communication: 'बातचीत केंद्र',
    nav_documents: 'कागजात वॉल्ट',
    nav_industry: 'उद्योग आ सीएसआर',
    nav_impact: 'असर आ परिणाम',
    nav_profile: 'प्रोफाइल',
    nav_report_problem: 'शिकायत दर्ज करीं',
    nav_my_problems: 'हमार ट्रैक रिकॉर्ड',
    nav_public_map: 'समस्या नक्शा',
    nav_solutions: 'समाधान सूची',
    nav_public_challenges: 'सार्वजनिक चुनौती',
    nav_collaborations: 'सहयोग निहोरा',
    nav_bounties: 'समस्या आ ईनाम',
    nav_logout: 'लॉग आउट',
    nav_login: 'लॉगिन करीं',
    notifications: 'सूचना',
    mark_all_read: 'सभ पढ़ल मान लीं',
    language_select: 'भाषा चुनीं',
    close: 'बंद करीं',
    cancel: 'रद्द करीं',
    save: 'सहेजीं',
    submit: 'जमा करीं',
    report_new_grievance: 'नया समस्या दर्ज करीं',
    empty_no_problems: 'अझुका ले कउनो समस्या दर्ज नइखे भइल।',
    empty_no_projects: 'कउनो प्रोजेक्ट चालू नइखे।'
  },
  mai: {
    brand_name: 'जनसेतु',
    govt_title: 'झारखंड सरकार',
    state_innovation_network: 'राज्य नवाचार आ सहभागिता नेटवर्क',
    university_portal: 'विश्वविद्यालय शैक्षणिक केंद्र',
    citizen_portal: 'नागरिक शिकायत निवारण पोर्टल',
    industry_portal: 'उद्योग आ सीएसआर पोर्टल',
    admin_portal: 'प्रशासन एआई कंसोल',
    nav_home: 'गृह',
    nav_dashboard: 'डैशबोर्ड',
    nav_challenges: 'नागरिक चुनौती',
    nav_projects: 'सक्रिय परियोजना',
    nav_proposals: 'अनुसंधान प्रस्ताव',
    nav_teams: 'दल',
    nav_milestones: 'मील के पाथर',
    nav_communication: 'संवाद केंद्र',
    nav_documents: 'दस्तावेज़',
    nav_industry: 'उद्योग आ सीएसआर',
    nav_impact: 'प्रभाव',
    nav_profile: 'प्रोफाइल',
    nav_report_problem: 'समस्या दर्ज करू',
    nav_my_problems: 'हमर ट्रैक रिकॉर्ड',
    nav_public_map: 'समस्या मानचित्र',
    nav_solutions: 'समाधान',
    nav_logout: 'लॉग आउट',
    nav_login: 'लॉगिन',
    notifications: 'सूचना',
    language_select: 'भाषा चुनू',
    close: 'बंद करू',
    cancel: 'रद्द करू',
    save: 'सुरक्षित करू',
    submit: 'जमा करू',
    report_new_grievance: 'समस्या दर्ज करू',
    empty_no_problems: 'एखन धरि कोनो समस्या दर्ज नहि भेल अछि।'
  },
  mr: {
    brand_name: 'जनसेतू',
    govt_title: 'झारखंड शासन',
    state_innovation_network: 'राज्य नवोपक्रम आणि सहकार्य नेटवर्क',
    university_portal: 'विद्यापीठ शैक्षणिक केंद्र',
    citizen_portal: 'नागरिक तक्रार निवारण पोर्टल',
    industry_portal: 'उद्योग आणि सीएसआर पोर्टल',
    admin_portal: 'प्रशासन एआय कन्सोल',
    nav_home: 'मुख्यपृष्ठ',
    nav_dashboard: 'डॅशबोर्ड',
    nav_challenges: 'नागरी आव्हाने',
    nav_projects: 'सक्रिय प्रकल्प',
    nav_proposals: 'संशोधन प्रस्ताव',
    nav_teams: 'प्रयोगशाळा संघ',
    nav_milestones: 'टप्पे आणि एसएलए',
    nav_communication: 'संवाद केंद्र',
    nav_documents: 'दस्तऐवज',
    nav_industry: 'उद्योग आणि सीएसआर',
    nav_impact: 'प्रभाव आणि मेट्रिक्स',
    nav_profile: 'प्रोफाइल',
    nav_report_problem: 'तक्रार नोंदवा',
    nav_my_problems: 'माझा ट्रॅक रेकॉर्ड',
    nav_public_map: 'समस्या नकाशा',
    nav_solutions: 'उपाय निर्देशिका',
    nav_logout: 'लॉग आउट',
    nav_login: 'लॉगिन',
    notifications: 'सूचना',
    language_select: 'भाषा निवडा',
    close: 'बंद करा',
    cancel: 'रद्द करा',
    save: 'बदल जतन करा',
    submit: 'सबमिट करा',
    report_new_grievance: 'नागरी समस्या नोंदवा',
    empty_no_problems: 'अद्याप कोणत्याही समस्या नोंदवल्या नाहीत.'
  },
  ta: {
    brand_name: 'ஜன்சேது',
    govt_title: 'ஜார்க்கண்ட் அரசு',
    state_innovation_network: 'மாநில கண்டுபிடிப்பு மற்றும் ஒத்துழைப்பு நெட்வொர்க்',
    university_portal: 'பல்கலைக்கழக மையம்',
    citizen_portal: 'குடிமக்கள் குறைதீர்ப்பு போர்டல்',
    industry_portal: 'தொழில் மற்றும் CSR போர்டல்',
    admin_portal: 'நிர்வாக AI கன்சோல்',
    nav_home: 'முகப்பு',
    nav_dashboard: 'டாஷ்போர்டு',
    nav_challenges: 'குடிமக்கள் சவால்கள்',
    nav_projects: 'செயலில் உள்ள திட்டங்கள்',
    nav_proposals: 'ஆராய்ச்சி திட்டங்கள்',
    nav_teams: 'ஆய்வக குழுக்கள்',
    nav_communication: 'தொடர்பு மையம்',
    nav_documents: 'ஆவணங்கள்',
    nav_industry: 'தொழில் மற்றும் CSR',
    nav_impact: 'தாக்கம் மற்றும் அளவீடுகள்',
    nav_profile: 'சுயவிவரம்',
    nav_report_problem: 'புகாரைப் பதிவு செய்க',
    nav_my_problems: 'எனது பதிவுகள்',
    nav_public_map: 'பிரச்சனை வரைபடம்',
    nav_solutions: 'தீர்வுகள்',
    nav_logout: 'வெளியேறு',
    nav_login: 'உள்நுழைக',
    notifications: 'அறிவிப்புகள்',
    language_select: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    close: 'மூடு',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    submit: 'சமர்ப்பி',
    report_new_grievance: 'புதிய பிரச்சனை பதிவு செய்க',
    empty_no_problems: 'இதுவரை எந்தப் பிரச்சனையும் பதிவு செய்யப்படவில்லை.'
  },
  te: {
    brand_name: 'జన్ సేతు',
    govt_title: 'జార్ఖండ్ ప్రభుత్వం',
    state_innovation_network: 'రాష్ట్ర ఆవిష్కరణ & సహకార నెట్వర్క్',
    university_portal: 'విశ్వవిద్యాలయ కేంద్రం',
    citizen_portal: 'పౌర సమస్యల పరిష్కార పోర్టల్',
    industry_portal: 'పరిశ్రమ & CSR పోర్టల్',
    admin_portal: 'పరిపాలన AI కన్సోల్',
    nav_home: 'హోమ్',
    nav_dashboard: 'డ్యాష్బోర్డ్',
    nav_challenges: 'పౌర సవాళ్లు',
    nav_projects: 'క్రియాశీల ప్రాజెక్టులు',
    nav_proposals: 'పరిశోధన ప్రతిపాదనలు',
    nav_teams: 'ల్యాబ్ బృందాలు',
    nav_communication: 'కమ్యూనికేషన్ హబ్',
    nav_documents: 'పత్రాలు',
    nav_industry: 'పరిశ్రమ & CSR',
    nav_impact: 'ప్రభావం & గణాంకాలు',
    nav_profile: 'ప్రొఫైల్',
    nav_report_problem: 'సమస్యను నివేదించండి',
    nav_my_problems: 'నా ట్రాక్ రికార్డ్',
    nav_public_map: 'సమస్యల మ్యాప్',
    nav_solutions: 'పరిష్కారాల డైరెక్టరీ',
    nav_logout: 'లాగ్ అవుట్',
    nav_login: 'లాగిన్',
    notifications: 'నోటిఫికేషన్లు',
    language_select: 'భాషను ఎంచుకోండి',
    close: 'మూసివేయి',
    cancel: 'రద్దు చేయి',
    save: 'భద్రపరుచు',
    submit: 'సమర్పించు',
    report_new_grievance: 'సమస్యను నివేదించండి',
    empty_no_problems: 'ఇంతవరకు ఎటువంటి సమస్యలు నమోదు కాలేదు.'
  },
  gu: {
    brand_name: 'જનસેતુ',
    govt_title: 'ઝારખંડ સરકાર',
    state_innovation_network: 'રાજ્ય ઇનોવેશન અને સહયોગ નેટવર્ક',
    university_portal: 'યુનિવર્સિટી પોર્ટલ',
    citizen_portal: 'નાગરિક ફરિયાદ નિવારણ પોર્ટલ',
    industry_portal: 'ઉદ્યોગ અને CSR પોર્ટલ',
    admin_portal: 'એડમિન AI કન્સોલ',
    nav_home: 'હોમ',
    nav_dashboard: 'ડેશબોર્ડ',
    nav_challenges: 'નાગરિક પડકારો',
    nav_projects: 'સક્રિય પ્રોજેક્ટ્સ',
    nav_proposals: 'સંશોધન દરખાસ્તો',
    nav_teams: 'લેબ ટીમો',
    nav_communication: 'સંચાર કેન્દ્ર',
    nav_documents: 'દસ્તાવેજો',
    nav_industry: 'ઉદ્યોગ અને CSR',
    nav_impact: 'અસર અને મેટ્રિક્સ',
    nav_profile: 'પ્રોફાઇલ',
    nav_report_problem: 'સમસ્યા નોંધાવો',
    nav_my_problems: 'મારો ટ્રેક રેકોર્ડ',
    nav_public_map: 'સમસ્યા નકશો',
    nav_solutions: 'ઉકેલો ડિરેક્ટરી',
    nav_logout: 'લૉગ આઉટ',
    nav_login: 'લૉગિન',
    notifications: 'સૂચનાઓ',
    language_select: 'ભાષા પસંદ કરો',
    close: 'બંધ કરો',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    submit: 'સબમિટ કરો',
    report_new_grievance: 'સમસ્યા નોંધાવો',
    empty_no_problems: 'હજી સુધી કોઈ સમસ્યા નોંધાઈ નથી.'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('jansetu_lang') || localStorage.getItem('jharinnovate_lang') || 'en';
  });

  const [isTranslateLoaded, setIsTranslateLoaded] = useState(false);

  // Set Google Translate cookie cleanly (without invalid domain on localhost)
  const setGoogleTranslateCookie = useCallback((gtCode) => {
    const cookieVal = (!gtCode || gtCode === 'en') ? '' : `/en/${gtCode}`;
    
    // Clean root path cookie
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    
    // If on a valid domain with dot, also set domain cookie
    const hostname = window.location.hostname;
    if (hostname && hostname.includes('.') && hostname !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
    }
  }, []);

  // Trigger Google Translate engine
  const triggerGoogleTranslate = useCallback((langCode) => {
    const targetObj = languages.find(l => l.code === langCode);
    const gtCode = targetObj?.gtCode || langCode;

    setGoogleTranslateCookie(gtCode);

    const dispatchCombo = () => {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        if (selectEl.value !== gtCode) {
          selectEl.value = gtCode;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          selectEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
      }
      return false;
    };

    if (!dispatchCombo()) {
      // Retry in intervals to catch async widget load
      const timer1 = setTimeout(dispatchCombo, 200);
      const timer2 = setTimeout(dispatchCombo, 600);
      const timer3 = setTimeout(dispatchCombo, 1200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [setGoogleTranslateCookie]);

  // Initialize Google Website Translator script safely
  useEffect(() => {
    // 1. Add hidden container for Google Translate element if not existing
    if (!document.getElementById('google_translate_element')) {
      const gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      document.body.appendChild(gtDiv);
    }

    // 2. Add style to hide Google Translate banner bar and keep clean modern UI
    if (!document.getElementById('gt-custom-hide-style')) {
      const style = document.createElement('style');
      style.id = 'gt-custom-hide-style';
      style.innerHTML = `
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        iframe.skiptranslate,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 3. Define callback and inject script
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
          setIsTranslateLoaded(true);

          const currentSaved = localStorage.getItem('jansetu_lang') || localStorage.getItem('jharinnovate_lang');
          if (currentSaved && currentSaved !== 'en') {
            setTimeout(() => triggerGoogleTranslate(currentSaved), 300);
          }
        } catch (e) {
          console.warn('Translate init note:', e);
        }
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      setIsTranslateLoaded(true);
    }
  }, [triggerGoogleTranslate]);

  // Route change and DOM mutation listener to re-sync translations on dynamic page transitions
  useEffect(() => {
    if (language === 'en') return;

    let timeoutId = null;
    const handleDOMMutation = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        triggerGoogleTranslate(language);
      }, 300);
    };

    // Re-trigger on pathname change
    triggerGoogleTranslate(language);

    // Watch for major DOM changes (new route pages, modals)
    const observer = new MutationObserver((mutations) => {
      const hasMajorChange = mutations.some(m => m.addedNodes.length > 0);
      if (hasMajorChange) {
        handleDOMMutation();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [language, triggerGoogleTranslate]);

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('jansetu_lang', langCode);
    localStorage.setItem('jharinnovate_lang', langCode);
    triggerGoogleTranslate(langCode);
  };

  const t = (key, fallback = '') => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    if (translations.hi && (language === 'bho' || language === 'mai' || language === 'hoc' || language === 'unr' || language === 'kru' || language === 'khr' || language === 'sck')) {
      if (translations.hi[key]) return translations.hi[key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const currentLangObj = languages.find(l => l.code === language) || languages.find(l => l.code === 'en') || languages[0];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languages,
      currentLang: currentLangObj,
      isTranslateLoaded
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
