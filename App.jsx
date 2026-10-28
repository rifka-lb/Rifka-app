import React, { useState, useEffect, useCallback } from "react";
import {
  Globe, ArrowLeft, ArrowRight, MessageCircle, Calendar, MapPin,
  CheckCircle2, Settings, BarChart3, Plus, Pencil, Trash2, Users,
  ChevronRight, Video, Building2, Loader2, LayoutGrid, Search,
  Brain, Heart, Palette, Puzzle, MessagesSquare, Activity, Dumbbell, HeartPulse, Sprout, User

} from "lucide-react";

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key, shared) {
      const raw = localStorage.getItem(`rifka:${shared ? "shared" : "local"}:${key}`);
      if (raw === null) throw new Error("not found");
      return { key, value: raw, shared: !!shared };
    },
    async set(key, value, shared) {
      localStorage.setItem(`rifka:${shared ? "shared" : "local"}:${key}`, value);
      return { key, value, shared: !!shared };
    },
    async delete(key, shared) {
      localStorage.removeItem(`rifka:${shared ? "shared" : "local"}:${key}`);
      return { key, deleted: true, shared: !!shared };
    },
    async list(prefix, shared) {
      const scope = `rifka:${shared ? "shared" : "local"}:`;
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(scope + (prefix || "")))
        .map((k) => k.slice(scope.length));
      return { keys, prefix, shared: !!shared };
    },
  };
}

/* ----------------------------------------------------------------------
   RIFKA — Mental Health & Coaching Discovery + Booking Platform (MVP)
   v2: specialists browse as one list (not category-first), each
   specialist can carry multiple specialty tags, purple palette confirmed.
   Booking hands off to each specialist's own Calendly link.
------------------------------------------------------------------------ */

const PALETTE = ["#6C5CA6", "#9B7FBE", "#E39BB0", "#7FB8A6", "#8FA6C9", "#C9A5D9"];

const DEFAULT_CATEGORIES = [
  { id: "c1", en: "Psychologists", ar: "أخصائيون نفسيون", active: true },
  { id: "c3", en: "Family & Marriage", ar: "مرافقة أسرية وزوجية", active: true },
  { id: "c4", en: "Teen & Adolescent", ar: "دعم المراهقين", active: true },
  { id: "c5", en: "Early Childhood", ar: "الطفولة المبكرة", active: true },
  { id: "c6", en: "Art & Jungian Therapy", ar: "العلاج بالفن واليونغي", active: true },
  { id: "c7", en: "Psychomotor Therapy", ar: "الحركة النفسية", active: true },
  { id: "c8", en: "Coaches (NLP & more)", ar: "مدرّبون (NLP وغيره)", active: true },
];

const DEFAULT_SPECIALISTS = [
  {
    id: "s_amal", order: 1, categoryIds: ["c1"], active: true, icon: "brain",
    name_en: "Amal Farha", name_ar: "أمل فرحة",
    title_en: "Licensed Clinical Psychologist", title_ar: "أخصائية نفسية سريرية مرخصة",
    bio_en: "Licensed clinical psychologist specializing in CBT, family counseling, parenting support, and child therapy.",
    bio_ar: "أخصائية نفسية سريرية مرخصة، متخصصة بالعلاج المعرفي السلوكي (CBT)، الإرشاد الأسري، دعم الأهل، وعلاج الأطفال.",
    location_en: "Minyeh-Dinniyeh, North Lebanon", location_ar: "المنية الضنية، الشمال",
    mode: "online", languages: "AR, EN",
    expertise_en: "CBT, Family Counseling, Parenting Support, Child Therapy",
    expertise_ar: "CBT، إرشاد أسري، دعم الأهل، علاج الأطفال",
    price: "Contact for pricing", credentials_en: "Licensed Clinical Psychologist", credentials_ar: "أخصائية نفسية سريرية مرخصة",
    calendly: "https://calendly.com/amal63653/30min", whatsapp: "96171694010",
  },
  {
    id: "s_nof", order: 2, categoryIds: ["c3"], active: true, icon: "heart",
    name_en: "Nof Nader", name_ar: "نوف نادر",
    title_en: "Family & Marriage Therapist, Certified Mediator", title_ar: "معالجة أسرية وزوجية معتمدة، ووسيطة أسرية",
    bio_en: "Certified family therapist and international mediator, practitioner in CBT, with a focus on couples and emotional health.",
    bio_ar: "معالجة أسرية وزوجية معتمدة، ووسيطة أسرية دولية. مختصة ممارسة بالعلاج المعرفي السلوكي (CBT)، مع تركيز على الأزواج والصحة الانفعالية.",
    location_en: "Beirut, Lebanon", location_ar: "بيروت",
    mode: "both", languages: "AR, EN, FR",
    expertise_en: "CBT, DBT, ACT, Couples, Addiction, Eating Disorders, Phobia & Anxiety, Sexual Wellness",
    expertise_ar: "CBT، DBT، ACT، الأزواج، الإدمان، اضطرابات الأكل، الفوبيا والقلق، الصحة الجنسية",
    price: "Contact for pricing", credentials_en: "Certified Family Mediator, International Trainer", credentials_ar: "وسيطة أسرية معتمدة، مدرّبة دولية",
    calendly: "https://calendly.com/nnlecointraining/30min", whatsapp: "96170809046",
  },
  {
    id: "s_caroline", order: 3, categoryIds: ["c6", "c8"], active: true, icon: "palette",
    name_en: "Caroline Nour", name_ar: "كارولين نور",
    title_en: "Art Therapist, Jungian & NLP Coach", title_ar: "معالجة بالفن، مدرّبة يونغية و NLP",
    bio_en: "Art therapy practitioner, Neurographic trainer, Jungian coach, and NLP Master Practitioner.",
    bio_ar: "معالجة بالفن، مدرّبة Neurographic، مدرّبة يونغية، وممارِسة NLP معتمدة.",
    location_en: "Beirut, Lebanon", location_ar: "بيروت",
    mode: "both", languages: "AR, EN, FR",
    expertise_en: "Art Therapy, Jungian Analysis, Neurographic Art, NLP",
    expertise_ar: "العلاج بالفن، التحليل اليونغي، Neurographic Art، NLP",
    price: "Contact for pricing", credentials_en: "Certified Art Therapist, NLP Master Practitioner", credentials_ar: "معالجة بالفن معتمدة، ممارِسة NLP معتمدة",
    calendly: "https://calendly.com/cncarolinenour/30min", whatsapp: "96178934436",
  },
  {
    id: "s_hanady", order: 4, categoryIds: ["c5", "c4"], active: true, icon: "puzzle",
    name_en: "Hanady Abou Meghli", name_ar: "هنادي أبو مغلي",
    title_en: "Early Childhood · Teen & Adolescent · Family", title_ar: "الطفولة المبكرة · المراهقين · العائلة",
    bio_en: "Specialist in special education, behavioral intervention, child & adolescent mental health, and family guidance.",
    bio_ar: "أخصائية بالتربية الخاصة، التدخل السلوكي، الصحة النفسية للأطفال والمراهقين، وتوجيه الأهل.",
    location_en: "Beirut - Sodeco", location_ar: "بيروت - الصوديكو",
    mode: "both", languages: "AR, EN",
    expertise_en: "Family Guidance, Special Education, Behavioral Intervention, Emotional Regulation",
    expertise_ar: "توجيه الأهل، التربية الخاصة، التدخل السلوكي، التنظيم الانفعالي",
    price: "Contact for pricing", credentials_en: "Special Education Specialist", credentials_ar: "أخصائية تربية خاصة",
    calendly: "https://calendly.com/hanadi-kronful/30min", whatsapp: "96170005833",
  },
  {
    id: "s_rajaa", order: 5, categoryIds: ["c3", "c8"], active: true, icon: "messages",
    name_en: "Rajaa Khalil", name_ar: "رجاء خليل",
    title_en: "Family & Social Counselor, NLP Master Practitioner", title_ar: "مستشارة أسرية واجتماعية، ممارِسة NLP معتمدة",
    bio_en: "Family and social counselor specializing in family relationships, parenting, and emotional wellbeing. NLP Master Practitioner.",
    bio_ar: "مستشارة أسرية واجتماعية، متخصصة بالعلاقات الأسرية، التربية، والرفاهية الانفعالية. ممارِسة NLP معتمدة.",
    location_en: "Choueifat", location_ar: "الشويفات",
    mode: "both", languages: "AR, EN",
    expertise_en: "Family Relationships, Parenting, Emotional Wellbeing, NLP",
    expertise_ar: "العلاقات الأسرية، التربية، الرفاهية الانفعالية، NLP",
    price: "Contact for pricing", credentials_en: "NLP Master Practitioner", credentials_ar: "ممارِسة NLP معتمدة",
    calendly: "https://calendly.com/rajaakhalil07/30min", whatsapp: "9613020338",
  },
  {
    id: "s_yara", order: 6, categoryIds: ["c7"], active: true, icon: "activity",
    name_en: "Yara Wehbe", name_ar: "يارا وهبي",
    title_en: "Psychomotor Therapist", title_ar: "أخصائية الحركة النفسية",
    bio_en: "Supports emotional regulation and development through body and movement.",
    bio_ar: "تدعم التنظيم الانفعالي والتطور عبر الجسد والحركة.",
    location_en: "Biakout, Lebanon", location_ar: "بياقوت",
    mode: "in-person", languages: "AR, EN, FR",
    expertise_en: "Psychomotricity, Child Development",
    expertise_ar: "الحركة النفسية، نمو الطفل",
    price: "Contact for pricing", credentials_en: "Certified Psychomotor Therapist", credentials_ar: "أخصائية حركة نفسية معتمدة",
    calendly: "https://calendly.com/yarawehbe02/45min", whatsapp: "96171946259",
  },
  {
    id: "s_zaynab", order: 7, categoryIds: ["c8", "c3"], active: true, icon: "heartpulse",
    name_en: "Zaynab Sowaydan", name_ar: "زينب سويدان",
    title_en: "Life & Fitness Coach · CBT · NLP & PEAT", title_ar: "كوتش حياة ولياقة · CBT · NLP وPEAT",
    bio_en: "Life & Fitness Coach and CBT Practitioner, NLP and PEAT Master Practitioner, with training in family and marriage guidance. Supports individuals and couples in building healthier habits, shifting limiting thought patterns, and creating lasting change in their relationships and daily lives. Sessions are practical, structured, and tailored to each person's goals.",
    bio_ar: "كوتش حياة ولياقة، وممارِسة CBT، وماستر برآكتيشنر NLP وPEAT، ولها تدريب في الإرشاد الأسري والزواجي. تدعم الأفراد والأزواج ببناء عادات أصح، وتغيير أنماط التفكير التي تعيق التقدم، وتحقيق تغيير حقيقي في حياتهم وعلاقاتهم. جلساتها عملية ومنظمة ومبنية على أهداف كل شخص.",
    location_en: "Online", location_ar: "أونلاين",
    mode: "online", languages: "AR, EN",
    expertise_en: "Life Coaching, Fitness Coaching, CBT, NLP, PEAT, Family & Marriage Guidance",
    expertise_ar: "كوتشينغ الحياة، كوتشينغ اللياقة، CBT، NLP، PEAT، الإرشاد الأسري والزواجي",
    price: "Contact for pricing", credentials_en: "NLP & PEAT Master Practitioner, CBT Practitioner", credentials_ar: "ماستر برآكتيشنر NLP وPEAT، ممارِسة CBT",
    calendly: "https://calendly.com/zedzed281181/session", whatsapp: "96170959875",
  },
  {
    id: "s_ibtihal", order: 8, categoryIds: ["c8", "c3"], active: true, icon: "heart",
    name_en: "Ibtihal Al-Musawi", name_ar: "ابتهال الموسوي",
    title_en: "Clinical Psychology Master's Student · Life Coach · Family & Marriage Guide", title_ar: "طالبة ماجستير علم نفس إكلينيكي · لايف كوتش · مرشدة أسرية وزوجية",
    bio_en: "Currently completing her Master's in Clinical Psychology, internationally certified Life Coach and trainer, and Family & Marriage Guide trained at NovaVision Academy. Supports individuals and couples in understanding themselves, strengthening their relationships and building a more balanced daily life. Sessions are offered in Arabic, online, from anywhere.",
    bio_ar: "تحضّر حالياً للماجستير في علم النفس الإكلينيكي، ولايف كوتش ومدرِّبة معتمدة دولياً، ومرشدة أسرية وزوجية متدرّبة في أكاديمية NovaVision. ترافق الأفراد والأزواج في فهم أنفسهم وتقوية علاقاتهم وبناء حياة يومية أكثر توازناً. جلساتها باللغة العربية، أونلاين ومن أي مكان.",
    location_en: "Online · Iraq", location_ar: "أونلاين · العراق",
    mode: "online", languages: "AR",
    expertise_en: "Life Coaching, Family & Marriage Guidance, Clinical Psychology (Master's in progress)",
    expertise_ar: "لايف كوتشينغ، الإرشاد الأسري والزواجي، علم النفس الإكلينيكي (ماجستير قيد الدراسة)",
    price: "Contact for pricing", credentials_en: "Certified Life Coach & Trainer, Family & Marriage Guide (NovaVision Academy)", credentials_ar: "لايف كوتش ومدرِّبة معتمدة، مرشدة أسرية وزوجية (أكاديمية NovaVision)",
    calendly: "https://calendly.com/ibtihalalmusawi3578/30min", whatsapp: "9647734278348",
  },
  {
    id: "s_zeina", order: 9, categoryIds: ["c8"], active: true, icon: "sprout",
    name_en: "Zeina Daroub", name_ar: "زينة الضاروب",
    title_en: "Resilience & Grief Coach · Corporate Trainer · Author · TEDx Speaker", title_ar: "مدرّبة في المرونة النفسية والتعافي من الفقد · مدرّبة مؤسسات · كاتبة · متحدثة TEDx",
    bio_en: "One-on-one coaching for women navigating identity loss and major life transitions while still carrying the responsibilities others see. Together we work through the grief beneath the outward strength, rebuild a sense of self, and find your footing again, using NLP, hypnosis, Time Line Therapy®, and yoga-based practices for grounding the body and mind. Sessions are available in Arabic, English, and French.",
    bio_ar: "جلسات كوتشينغ فردية للنساء اللواتي يمررن بفقدان الهوية أو تحوّل كبير في حياتهن، وما زلن يحملن مسؤوليات يراها الآخرون بوضوح. نعمل معاً على الحزن الكامن خلف القوة الظاهرة، ونعيد بناء إحساسك بذاتك، ونجد توازنك من جديد، باستخدام تقنيات NLP والتنويم الإيحائي وTime Line Therapy®، إلى جانب ممارسات اليوغا لتثبيت الجسد والعقل. الجلسات متوفرة بالعربية والإنجليزية والفرنسية.",
    location_en: "Online · Lebanon", location_ar: "أونلاين · لبنان",
    mode: "online", languages: "AR, EN, FR",
    expertise_en: "Resilience, Grief & Loss, Identity & Life Transitions, NLP, Hypnosis, Time Line Therapy®, Yoga-based Practices",
    expertise_ar: "المرونة النفسية، الحزن والفقد، الهوية والتحولات الحياتية، NLP، التنويم الإيحائي، Time Line Therapy®، ممارسات اليوغا",
    price: "Contact for pricing", credentials_en: "Corporate Trainer, Author, TEDx Speaker", credentials_ar: "مدرّبة مؤسسات، كاتبة، متحدثة TEDx",
    calendly: "https://link.msgsndr.com/widget/bookings/my-calendar-2024-discovery-call-89cf221a-3af2-444f-8bcb-04d38ebd4b23", whatsapp: "96181448034",
  },
];

const T = {
  en: {
    brandTag: "Your circle of care, for every stage of life.",
    searchPlaceholder: "Search by name or specialty",
    allFilter: "All specialists",
    noResults: "No specialists match this search.",
    backHome: "Back to home",
    bookAppointment: "Book Appointment",
    contactWhatsapp: "Contact via WhatsApp",
    location: "Location", languages: "Languages", expertise: "Areas of expertise",
    price: "Session price", credentials: "Credentials",
    online: "Online", inperson: "In person", both: "Online & in person",
    aboutTitle: "About",
    prebookTitle: "A few quick questions",
    prebookNote: "These questions are for booking and preparation purposes only. They are not a psychological assessment or diagnosis. Your answers help the professional better understand what you are looking for before your session.",
    q1: "What would you like support with?",
    q1opts: ["Anxiety / Stress", "Relationships", "Family", "Depression / Low Mood", "Trauma", "Parenting", "Personal Development", "Work / Burnout", "Other"],
    q2: "Is this your first session with a mental health professional?",
    q2opts: ["Yes", "No"],
    q3: "How would you prefer to have your session?",
    q3opts: ["Online", "In person"],
    q4: "Anything you'd like the professional to know before the session? (optional)",
    q4placeholder: "Write a short note if you'd like...",
    continue: "Continue to scheduling",
    confirmTitle: "You're almost booked",
    confirmSub: "Your answers will be shared with the specialist before your session — you won't need to repeat them.",
    openCalendly: "Choose a date & time",
    yourAnswers: "Your answers",
    backToProfile: "Back to profile",
    home: "Home", admin: "Admin", adminTitle: "Admin Dashboard",
    overview: "Overview", specialistsTab: "Specialists", categoriesTab: "Categories", bookingsTab: "Bookings",
    visitors: "Visitors", specialtyViews: "Filter uses", profileViews: "Profile views",
    bookClicks: "Book clicks", bookingAttempts: "Booking attempts", whatsappClicks: "WhatsApp clicks",
    perSpecialist: "Per-specialist performance",
    addSpecialist: "Add specialist", addCategory: "Add specialty tag",
    edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel",
    activeLabel: "Active", inactiveLabel: "Inactive", toggleActive: "Toggle active",
    nameEn: "Name (English)", nameAr: "Name (Arabic)",
    titleEn: "Title (English)", titleAr: "Title (Arabic)",
    bioEn: "Bio (English)", bioAr: "Bio (Arabic)",
    catField: "Specialty tags (select all that apply)",
    priceField: "Price", calendlyField: "Calendly link", whatsappField: "WhatsApp number", orderField: "Display order",
    recentBookings: "Recent booking attempts", noBookings: "No booking attempts yet.",
    loading: "Loading...", exit: "Exit admin",
  },
  ar: {
    brandTag: "دائرة رعايتك، بكل مرحلة من حياتك.",
    searchPlaceholder: "ابحثي بالاسم أو الاختصاص",
    allFilter: "كل الأخصائيين",
    noResults: "ما في نتائج مطابقة لبحثك.",
    backHome: "الرجوع للرئيسية",
    bookAppointment: "احجزي موعد", contactWhatsapp: "تواصلي عبر واتساب",
    location: "الموقع", languages: "اللغات", expertise: "مجالات الخبرة",
    price: "سعر الجلسة", credentials: "المؤهلات",
    online: "أونلاين", inperson: "حضورياً", both: "أونلاين وحضورياً",
    aboutTitle: "نبذة",
    prebookTitle: "بضعة أسئلة سريعة",
    prebookNote: "هذه الأسئلة مخصّصة لتنظيم الحجز والتحضير للجلسة فقط، وليست تقييماً نفسياً أو تشخيصاً. تساعد إجاباتك المختص على فهم ما تبحث عنه بشكل أفضل قبل الجلسة.",
    q1: "شو حابة تاخدي دعم فيه؟",
    q1opts: ["قلق / توتر", "علاقات", "عائلة", "اكتئاب / مزاج منخفض", "صدمة", "تربية الأولاد", "تطوير الذات", "العمل / إرهاق", "غير ذلك"],
    q2: "هل هاي أول جلسة إلك مع مختص/ة نفسي/ة؟",
    q2opts: ["نعم", "لا"],
    q3: "كيف حابة تكون جلستك؟",
    q3opts: ["أونلاين", "حضورياً"],
    q4: "في شي حابة يعرفه المختص/ة قبل الجلسة؟ (اختياري)",
    q4placeholder: "اكتبي ملاحظة قصيرة إذا حبيتي...",
    continue: "متابعة لاختيار الموعد",
    confirmTitle: "خطوة وحدة وبتخلص الحجز",
    confirmSub: "رح تُشارَك إجاباتك مع المختص/ة قبل جلستك — ما رح تحتاجي تعيديها.",
    openCalendly: "اختاري التاريخ والوقت",
    yourAnswers: "إجاباتك",
    backToProfile: "الرجوع للبروفايل",
    home: "الرئيسية", admin: "الإدارة", adminTitle: "لوحة التحكم",
    overview: "نظرة عامة", specialistsTab: "الأخصائيون", categoriesTab: "الاختصاصات", bookingsTab: "الحجوزات",
    visitors: "الزوار", specialtyViews: "استخدام الفلترة", profileViews: "مشاهدات البروفايل",
    bookClicks: "نقرات الحجز", bookingAttempts: "محاولات الحجز", whatsappClicks: "نقرات واتساب",
    perSpecialist: "أداء كل أخصائي/ة",
    addSpecialist: "إضافة أخصائي/ة", addCategory: "إضافة وسم اختصاص",
    edit: "تعديل", delete: "حذف", save: "حفظ", cancel: "إلغاء",
    activeLabel: "فعّال", inactiveLabel: "غير فعّال", toggleActive: "تفعيل/تعطيل",
    nameEn: "الاسم (إنجليزي)", nameAr: "الاسم (عربي)",
    titleEn: "اللقب المهني (إنجليزي)", titleAr: "اللقب المهني (عربي)",
    bioEn: "نبذة (إنجليزي)", bioAr: "نبذة (عربي)",
    catField: "وسوم الاختصاص (اختاري كل ما ينطبق)",
    priceField: "السعر", calendlyField: "رابط Calendly", whatsappField: "رقم واتساب", orderField: "ترتيب الظهور",
    recentBookings: "أحدث محاولات الحجز", noBookings: "ما في محاولات حجز بعد.",
    loading: "عم يحمّل...", exit: "الخروج من لوحة الإدارة",
  },
};

function useStore() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [specialists, setSpecialists] = useState(DEFAULT_SPECIALISTS);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({ visitors: 0, filterUses: {}, profileViews: {}, bookClicks: {}, bookingAttempts: {}, whatsappClicks: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, s, b, a] = await Promise.allSettled([
          window.storage.get("rifka_categories_v2", true),
          window.storage.get("rifka_specialists_v2", true),
          window.storage.get("rifka_bookings_v2", true),
          window.storage.get("rifka_analytics_v2", true),
        ]);
        if (cancelled) return;
        if (c.status === "fulfilled" && c.value) setCategories(JSON.parse(c.value.value));
        else await window.storage.set("rifka_categories_v2", JSON.stringify(DEFAULT_CATEGORIES), true);
        if (s.status === "fulfilled" && s.value) {
          const parsed = JSON.parse(s.value.value);
          const defById = new Map(DEFAULT_SPECIALISTS.map((d) => [d.id, d]));
          const stored = parsed.map((x) => (defById.has(x.id) ? { ...x, active: defById.get(x.id).active } : x));
          const have = new Set(stored.map((x) => x.id));
          const added = DEFAULT_SPECIALISTS.filter((d) => !have.has(d.id));
          const merged = added.length ? [...stored, ...added] : stored;
          const changed = added.length > 0 || stored.some((x, i) => x.active !== parsed[i].active);
          setSpecialists(merged);
          if (changed) { try { await window.storage.set("rifka_specialists_v2", JSON.stringify(merged), true); } catch (e) { console.error(e); } }
        }
        else await window.storage.set("rifka_specialists_v2", JSON.stringify(DEFAULT_SPECIALISTS), true);
        if (b.status === "fulfilled" && b.value) setBookings(JSON.parse(b.value.value));
        if (a.status === "fulfilled" && a.value) setAnalytics(JSON.parse(a.value.value));
      } catch (e) { console.error("store init error", e); }
      finally { if (!cancelled) setReady(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const persistCategories = useCallback(async (next) => {
    setCategories(next);
    try { await window.storage.set("rifka_categories_v2", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);
  const persistSpecialists = useCallback(async (next) => {
    setSpecialists(next);
    try { await window.storage.set("rifka_specialists_v2", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);
  const persistBookings = useCallback(async (next) => {
    setBookings(next);
    try { await window.storage.set("rifka_bookings_v2", JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);

  const logEvent = useCallback((metric, id) => {
    setAnalytics((prev) => {
      const next = { ...prev };
      if (metric === "visitors") next.visitors = (prev.visitors || 0) + 1;
      else {
        next[metric] = { ...(prev[metric] || {}) };
        next[metric][id] = (next[metric][id] || 0) + 1;
      }
      window.storage.set("rifka_analytics_v2", JSON.stringify(next), true).catch((e) => console.error(e));
      return next;
    });
  }, []);

  return {
    ready, categories, specialists, bookings, analytics,
    setCategories: persistCategories, setSpecialists: persistSpecialists,
    setBookings: persistBookings, logEvent,
  };
}

function OrbitMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="110" fill="#F0EAFB" />
      <g transform="translate(256,256)">
        <path d="M 0,-135 A 135,135 0 1 1 -94,-94 A 94,94 0 1 0 -28,-28"
          fill="none" stroke="#9B7FD1" strokeWidth="16" strokeLinecap="round" />
        <g transform="translate(-28,-28) scale(0.74)">
          <path d="M -18,-2 C -34,-22 -66,-14 -66,10 C -66,32 -40,48 -18,70 C 4,48 30,32 30,10 C 30,-14 -2,-22 -18,-2 Z"
            fill="none" stroke="#8A6BC4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="-6" cy="-40" r="17" fill="#6B4FA0" />
          <circle cx="20" cy="-28" r="13" fill="#B39DE8" />
          <path d="M 35,-4 C 26,-15 10,-11 10,1 C 10,11 24,20 35,32 C 46,20 60,11 60,1 C 60,-11 44,-15 35,-4 Z"
            fill="none" stroke="#D8C2F0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="35" cy="-20" r="6.5" fill="#D8C2F0" />
        </g>
      </g>
    </svg>
  );
}

const SPECIALTY_ICONS = { brain: Brain, heart: Heart, palette: Palette, puzzle: Puzzle, messages: MessagesSquare, activity: Activity, dumbbell: Dumbbell, heartpulse: HeartPulse, sprout: Sprout };

function Avatar({ name, icon, colorIndex, size = 56 }) {
  const Icon = SPECIALTY_ICONS[icon] || User;
  return (
    <div className="rounded-full flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size, background: PALETTE[colorIndex % PALETTE.length] }}>
      <Icon size={size * 0.5} strokeWidth={1.8} />
    </div>
  );
}

function Pill({ children, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    pink: "bg-pink-100 text-pink-700",
    green: "bg-emerald-100 text-emerald-700",
    gray: "bg-slate-100 text-slate-600",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold px-5 py-3 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-700 hover:-translate-y-0.5 shadow-sm hover:shadow-md",
    secondary: "bg-white text-violet-700 border border-violet-200 hover:border-violet-400",
    ghost: "text-violet-700 hover:bg-violet-50",
    whatsapp: "bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 shadow-sm",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default function Rifka() {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("home");
  const [activeSpecialist, setActiveSpecialist] = useState(null);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "", q4: "" });
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const store = useStore();
  const t = T[lang];
  const isAr = lang === "ar";
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => { if (store.ready) store.logEvent("visitors"); // eslint-disable-next-line
  }, [store.ready]);

  useEffect(() => { document.documentElement.dir = isAr ? "rtl" : "ltr"; }, [isAr]);

  const goHome = () => { setView("home"); setActiveSpecialist(null); };

  const openSpecialist = (sp) => {
    setActiveSpecialist(sp);
    setView("specialist");
    store.logEvent("profileViews", sp.id);
  };

  const setFilter = (catId) => {
    setActiveFilter(catId);
    if (catId !== "all") store.logEvent("filterUses", catId);
  };

  const startBooking = (sp) => {
    store.logEvent("bookClicks", sp.id);
    setAnswers({ q1: "", q2: "", q3: "", q4: "" });
    setView("booking");
  };

  const submitBooking = async () => {
    const sp = activeSpecialist;
    store.logEvent("bookingAttempts", sp.id);
    const record = {
      id: `b_${Date.now()}`, specialistId: sp.id,
      specialistName: lang === "ar" ? sp.name_ar : sp.name_en,
      answers, lang, timestamp: new Date().toISOString(),
    };
    await store.setBookings([record, ...store.bookings]);
    setView("confirm");
  };

  const clickWhatsapp = (sp) => {
    store.logEvent("whatsappClicks", sp.id);
    window.open(`https://wa.me/${sp.whatsapp}`, "_blank");
  };

  if (!store.ready) {
    return <div className="min-h-screen flex items-center justify-center bg-violet-50"><Loader2 className="animate-spin text-violet-500" size={28} /></div>;
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#FAF8FD] text-slate-800" style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap');`}</style>

      <TopNav t={t} lang={lang} setLang={setLang} goHome={goHome} view={view} setView={setView} />

      <main className="max-w-5xl mx-auto px-5 pb-24">
        {view === "home" && (
          <HomeView t={t} lang={lang} store={store} search={search} setSearch={setSearch} activeFilter={activeFilter} setFilter={setFilter} openSpecialist={openSpecialist} />
        )}
        {view === "specialist" && activeSpecialist && (
          <SpecialistView t={t} lang={lang} sp={activeSpecialist} onBack={goHome} BackIcon={BackIcon} onBook={() => startBooking(activeSpecialist)} onWhatsapp={() => clickWhatsapp(activeSpecialist)} categories={store.categories} />
        )}
        {view === "booking" && activeSpecialist && (
          <BookingView t={t} lang={lang} sp={activeSpecialist} answers={answers} setAnswers={setAnswers} onBack={() => setView("specialist")} BackIcon={BackIcon} onSubmit={submitBooking} />
        )}
        {view === "confirm" && activeSpecialist && (
          <ConfirmView t={t} lang={lang} sp={activeSpecialist} answers={answers} onDone={goHome} />
        )}
        {view === "admin" && (
          adminUnlocked
            ? <AdminView t={t} lang={lang} store={store} />
            : <AdminGate lang={lang} onUnlock={() => setAdminUnlocked(true)} />
        )}
      </main>

      <footer className="border-t border-violet-100 py-8 text-center text-xs text-slate-400">
        <button onClick={() => setView(view === "admin" ? "home" : "admin")} className="inline-flex items-center gap-1.5 hover:text-violet-500 transition-colors">
          <Settings size={13} /> {view === "admin" ? t.exit : t.admin}
        </button>
      </footer>
    </div>
  );
}

function TopNav({ t, lang, setLang, goHome, view, setView }) {
  return (
    <nav className="sticky top-0 z-40 bg-[#FAF8FD]/90 backdrop-blur border-b border-violet-100">
      <div className="max-w-5xl mx-auto px-5 h-20 grid grid-cols-3 items-center">
        <div />
        <button onClick={goHome} className="flex items-center justify-center gap-2.5 font-extrabold text-xl text-violet-800">
          <OrbitMark size={44} />
          Rifka
        </button>
        <div className="flex justify-end">
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="flex items-center gap-1.5 text-sm font-medium text-violet-700 border border-violet-200 rounded-full px-3.5 py-1.5 hover:border-violet-400 transition-colors">
            <Globe size={14} /> {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomeView({ t, lang, store, search, setSearch, activeFilter, setFilter, openSpecialist }) {
  const q = search.trim().toLowerCase();
  const list = store.specialists
    .filter((sp) => sp.active)
    .filter((sp) => activeFilter === "all" || sp.categoryIds.includes(activeFilter))
    .filter((sp) => {
      if (!q) return true;
      const name = (lang === "ar" ? sp.name_ar : sp.name_en).toLowerCase();
      const title = (lang === "ar" ? sp.title_ar : sp.title_en).toLowerCase();
      return name.includes(q) || title.includes(q);
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div>
      <section className="pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 bg-violet-100 rounded-full px-3.5 py-1.5 mb-5">
          <OrbitMark size={15} /> Rifka
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-violet-950 leading-tight mb-3">
          {lang === "ar" ? "احجزي موعدك مع مختص/ة موثوق" : "Book with a trusted specialist"}
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto mb-8">{t.brandTag}</p>
        <div className="max-w-md mx-auto relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-slate-300" style={{ [lang === "ar" ? "right" : "left"]: 18 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
            className={`w-full rounded-full border border-violet-200 bg-white py-3.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all ${lang === "ar" ? "pr-11 pl-5" : "pl-11 pr-5"}`} />
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        <FilterPill active={activeFilter === "all"} onClick={() => setFilter("all")}>{t.allFilter}</FilterPill>
        {store.categories.filter((c) => c.active && store.specialists.some((sp) => sp.active && sp.categoryIds.includes(c.id))).map((c) => (
          <FilterPill key={c.id} active={activeFilter === c.id} onClick={() => setFilter(c.id)}>{lang === "ar" ? c.ar : c.en}</FilterPill>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-14">{t.noResults}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((sp, i) => (
            <SpecialistCard key={sp.id} sp={sp} lang={lang} categories={store.categories} onClick={() => openSpecialist(sp)} colorIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
      active ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-violet-200 text-slate-600 hover:border-violet-400"
    }`}>
      {children}
    </button>
  );
}

function SpecialistCard({ sp, lang, categories, onClick, colorIndex }) {
  const tags = sp.categoryIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean);
  const tagLine = tags.map((tag) => (lang === "ar" ? tag.ar : tag.en)).join(" · ");
  return (
    <button onClick={onClick} className="text-start bg-white rounded-2xl border border-violet-100 p-4 hover:border-violet-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <Avatar name={lang === "ar" ? sp.name_ar : sp.name_en} icon={sp.icon} colorIndex={colorIndex} />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-violet-950 truncate">{lang === "ar" ? sp.name_ar : sp.name_en}</div>
          <div className="text-xs text-slate-500 truncate">{lang === "ar" ? sp.title_ar : sp.title_en}</div>
          {tagLine && <div className="text-xs text-violet-500 font-medium truncate mt-0.5">{tagLine}</div>}
        </div>
      </div>
    </button>
  );
}

function SpecialistView({ t, lang, sp, onBack, BackIcon, onBook, onWhatsapp, categories }) {
  const modeLabel = { online: t.online, "in-person": t.inperson, both: t.both }[sp.mode] || sp.mode;
  const ModeIcon = sp.mode === "online" ? Video : sp.mode === "in-person" ? Building2 : Video;
  const tags = sp.categoryIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean);
  return (
    <div className="pt-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-violet-600 mb-6 hover:text-violet-800">
        <BackIcon size={15} /> {t.backHome}
      </button>

      <div className="bg-white rounded-3xl border border-violet-100 p-7 sm:p-9">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
          <Avatar name={lang === "ar" ? sp.name_ar : sp.name_en} icon={sp.icon} colorIndex={0} size={76} />
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-violet-950">{lang === "ar" ? sp.name_ar : sp.name_en}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{lang === "ar" ? sp.title_ar : sp.title_en}</p>
            {tags.length > 0 && (
              <p className="text-violet-500 text-xs font-medium mt-1.5">
                {tags.map((tag) => (lang === "ar" ? tag.ar : tag.en)).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button onClick={onBook} className="flex-1"><Calendar size={16} /> {t.bookAppointment}</Button>
          <Button onClick={onWhatsapp} variant="whatsapp" className="flex-1"><MessageCircle size={16} /> {t.contactWhatsapp}</Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <InfoRow icon={MapPin} label={t.location} value={lang === "ar" ? sp.location_ar : sp.location_en} />
          <InfoRow icon={ModeIcon} label={lang === "ar" ? "طريقة الجلسة" : "Session format"} value={modeLabel} />
          <InfoRow icon={Globe} label={t.languages} value={sp.languages} />
          <InfoRow icon={CheckCircle2} label={t.credentials} value={lang === "ar" ? sp.credentials_ar : sp.credentials_en} />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-violet-950 mb-2">{t.aboutTitle}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{lang === "ar" ? sp.bio_ar : sp.bio_en}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-violet-950 mb-2">{t.expertise}</h3>
          <div className="flex flex-wrap gap-2">
            {(lang === "ar" ? sp.expertise_ar : sp.expertise_en).split(",").map((item, i) => (
              <Pill key={i} tone={i % 2 === 0 ? "violet" : "pink"}>{item.trim()}</Pill>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-violet-50/60 rounded-xl p-3.5">
      <Icon size={16} className="text-violet-500 mt-0.5 shrink-0" />
      <div><div className="text-xs text-slate-400">{label}</div><div className="text-sm font-medium text-slate-700">{value}</div></div>
    </div>
  );
}

function BookingView({ t, lang, sp, answers, setAnswers, onBack, BackIcon, onSubmit }) {
  const canSubmit = answers.q1 && answers.q2 && answers.q3;
  return (
    <div className="pt-8 max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-violet-600 mb-6 hover:text-violet-800">
        <BackIcon size={15} /> {t.backToProfile}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Avatar name={lang === "ar" ? sp.name_ar : sp.name_en} icon={sp.icon} colorIndex={0} size={44} />
        <div><div className="text-xs text-slate-400">{t.bookAppointment}</div><div className="font-semibold text-violet-950">{lang === "ar" ? sp.name_ar : sp.name_en}</div></div>
      </div>

      <h1 className="text-xl font-extrabold text-violet-950 mb-2">{t.prebookTitle}</h1>
      <p className="text-xs text-slate-500 bg-violet-50 rounded-xl p-3.5 mb-7 leading-relaxed">{t.prebookNote}</p>

      <div className="space-y-7">
        <QuestionBlock label={t.q1}>
          <div className="grid grid-cols-2 gap-2">
            {t.q1opts.map((opt) => <ChoiceChip key={opt} selected={answers.q1 === opt} onClick={() => setAnswers({ ...answers, q1: opt })}>{opt}</ChoiceChip>)}
          </div>
        </QuestionBlock>
        <QuestionBlock label={t.q2}>
          <div className="flex gap-2">{t.q2opts.map((opt) => <ChoiceChip key={opt} selected={answers.q2 === opt} onClick={() => setAnswers({ ...answers, q2: opt })}>{opt}</ChoiceChip>)}</div>
        </QuestionBlock>
        <QuestionBlock label={t.q3}>
          <div className="flex gap-2">{t.q3opts.map((opt) => <ChoiceChip key={opt} selected={answers.q3 === opt} onClick={() => setAnswers({ ...answers, q3: opt })}>{opt}</ChoiceChip>)}</div>
        </QuestionBlock>
        <QuestionBlock label={t.q4}>
          <textarea value={answers.q4} onChange={(e) => setAnswers({ ...answers, q4: e.target.value })} placeholder={t.q4placeholder} rows={3}
            className="w-full rounded-xl border border-violet-200 p-3.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none" />
        </QuestionBlock>
      </div>

      <Button onClick={onSubmit} disabled={!canSubmit} className="w-full mt-8">
        {t.continue} <ChevronRight size={16} className={lang === "ar" ? "rotate-180" : ""} />
      </Button>
    </div>
  );
}

function QuestionBlock({ label, children }) {
  return <div><div className="text-sm font-semibold text-violet-950 mb-2.5">{label}</div>{children}</div>;
}

function ChoiceChip({ children, selected, onClick }) {
  return (
    <button onClick={onClick} className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
      selected ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-violet-200 text-slate-600 hover:border-violet-400"
    }`}>{children}</button>
  );
}

function ConfirmView({ t, lang, sp, answers, onDone }) {
  return (
    <div className="pt-14 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={28} /></div>
      <h1 className="text-2xl font-extrabold text-violet-950 mb-2">{t.confirmTitle}</h1>
      <p className="text-sm text-slate-500 mb-8">{t.confirmSub}</p>
      <div className="bg-white rounded-2xl border border-violet-100 p-5 text-start mb-7">
        <div className="text-xs font-bold text-violet-950 mb-3">{t.yourAnswers}</div>
        <AnswerRow label={t.q1} value={answers.q1} />
        <AnswerRow label={t.q2} value={answers.q2} />
        <AnswerRow label={t.q3} value={answers.q3} />
        {answers.q4 && <AnswerRow label={t.q4} value={answers.q4} />}
      </div>
      <a href={sp.calendly} target="_blank" rel="noopener noreferrer" className="block">
        <Button className="w-full mb-3"><Calendar size={16} /> {t.openCalendly}</Button>
      </a>
      <Button variant="ghost" onClick={onDone} className="w-full">{t.backHome}</Button>
    </div>
  );
}

function AnswerRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-violet-50 last:border-0 text-sm">
      <span className="text-slate-400 shrink-0">{label.length > 30 ? label.slice(0, 30) + "…" : label}</span>
      <span className="font-medium text-slate-700 text-end">{value}</span>
    </div>
  );
}

/* ------------------------------- ADMIN ------------------------------- */

const ADMIN_PASSWORD = "MZD@44";

function AdminGate({ lang, onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const isAr = lang === "ar";

  const submit = (e) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) { onUnlock(); }
    else { setError(true); }
  };

  return (
    <div className="pt-24 max-w-sm mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-6">
        <Settings size={22} />
      </div>
      <h1 className="text-xl font-extrabold text-violet-950 mb-2">
        {isAr ? "دخول الإدارة" : "Admin Access"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {isAr ? "هاي الصفحة محمية. أدخلي كلمة السر للمتابعة." : "This page is protected. Enter the password to continue."}
      </p>
      <form onSubmit={submit}>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder={isAr ? "كلمة السر" : "Password"}
          className={`w-full rounded-full border px-5 py-3.5 text-sm outline-none text-center mb-3 ${error ? "border-rose-400 focus:border-rose-500" : "border-violet-200 focus:border-violet-500"}`}
          autoFocus
        />
        {error && <p className="text-xs text-rose-500 mb-3">{isAr ? "كلمة السر غلط" : "Incorrect password"}</p>}
        <Button type="submit" className="w-full">{isAr ? "دخول" : "Unlock"}</Button>
      </form>
    </div>
  );
}

function AdminView({ t, lang, store }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: t.overview, icon: BarChart3 },
    { id: "specialists", label: t.specialistsTab, icon: Users },
    { id: "categories", label: t.categoriesTab, icon: LayoutGrid },
    { id: "bookings", label: t.bookingsTab, icon: Calendar },
  ];
  return (
    <div className="pt-8">
      <h1 className="text-2xl font-extrabold text-violet-950 mb-6">{t.adminTitle}</h1>
      <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            tab === tb.id ? "bg-violet-600 text-white" : "bg-white text-slate-600 border border-violet-100"
          }`}>
            <tb.icon size={13} /> {tb.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <AdminOverview t={t} lang={lang} store={store} />}
      {tab === "specialists" && <AdminSpecialists t={t} lang={lang} store={store} />}
      {tab === "categories" && <AdminCategories t={t} lang={lang} store={store} />}
      {tab === "bookings" && <AdminBookings t={t} lang={lang} store={store} />}
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="bg-white rounded-2xl border border-violet-100 p-4"><div className="text-2xl font-extrabold text-violet-950">{value}</div><div className="text-xs text-slate-400 mt-1">{label}</div></div>;
}
function sumValues(obj) { return Object.values(obj || {}).reduce((a, b) => a + b, 0); }

function AdminOverview({ t, lang, store }) {
  const a = store.analytics;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-9">
        <StatCard label={t.visitors} value={a.visitors || 0} />
        <StatCard label={t.specialtyViews} value={sumValues(a.filterUses)} />
        <StatCard label={t.profileViews} value={sumValues(a.profileViews)} />
        <StatCard label={t.bookClicks} value={sumValues(a.bookClicks)} />
        <StatCard label={t.bookingAttempts} value={sumValues(a.bookingAttempts)} />
        <StatCard label={t.whatsappClicks} value={sumValues(a.whatsappClicks)} />
      </div>
      <h3 className="text-sm font-bold text-violet-950 mb-3">{t.perSpecialist}</h3>
      <div className="bg-white rounded-2xl border border-violet-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-violet-50 text-xs text-slate-500">
            <th className="text-start p-3 font-medium">{lang === "ar" ? "الاسم" : "Name"}</th>
            <th className="text-center p-3 font-medium">{t.profileViews}</th>
            <th className="text-center p-3 font-medium">{t.bookClicks}</th>
            <th className="text-center p-3 font-medium">{t.bookingAttempts}</th>
            <th className="text-center p-3 font-medium">{t.whatsappClicks}</th>
          </tr></thead>
          <tbody>
            {store.specialists.sort((x, y) => (x.order || 0) - (y.order || 0)).map((sp) => (
              <tr key={sp.id} className="border-t border-violet-50">
                <td className="p-3 font-medium text-slate-700">{lang === "ar" ? sp.name_ar : sp.name_en}</td>
                <td className="p-3 text-center text-slate-500">{(a.profileViews || {})[sp.id] || 0}</td>
                <td className="p-3 text-center text-slate-500">{(a.bookClicks || {})[sp.id] || 0}</td>
                <td className="p-3 text-center text-slate-500">{(a.bookingAttempts || {})[sp.id] || 0}</td>
                <td className="p-3 text-center text-slate-500">{(a.whatsappClicks || {})[sp.id] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const emptySpecialist = {
  id: "", order: 99, categoryIds: [], active: true,
  name_en: "", name_ar: "", title_en: "", title_ar: "",
  bio_en: "", bio_ar: "", location_en: "", location_ar: "", mode: "online",
  languages: "", expertise_en: "", expertise_ar: "", price: "", credentials_en: "",
  credentials_ar: "", calendly: "", whatsapp: "",
};

function AdminSpecialists({ t, lang, store }) {
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const startAdd = () => { setEditing({ ...emptySpecialist, id: `s_${Date.now()}` }); setIsNew(true); };
  const startEdit = (sp) => { setEditing({ ...sp }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };
  const save = async () => {
    const next = isNew ? [...store.specialists, editing] : store.specialists.map((s) => (s.id === editing.id ? editing : s));
    await store.setSpecialists(next);
    cancel();
  };
  const remove = async (id) => { await store.setSpecialists(store.specialists.filter((s) => s.id !== id)); };
  const toggleActive = async (sp) => { await store.setSpecialists(store.specialists.map((s) => (s.id === sp.id ? { ...s, active: !s.active } : s))); };

  if (editing) return <SpecialistForm t={t} lang={lang} categories={store.categories} value={editing} onChange={setEditing} onSave={save} onCancel={cancel} />;

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={startAdd}><Plus size={15} /> {t.addSpecialist}</Button></div>
      <div className="space-y-2.5">
        {store.specialists.sort((a, b) => (a.order || 0) - (b.order || 0)).map((sp, i) => (
          <div key={sp.id} className="flex items-center gap-3 bg-white rounded-xl border border-violet-100 p-3.5">
            <span className="text-xs text-slate-300 font-bold w-4">{sp.order}</span>
            <Avatar name={lang === "ar" ? sp.name_ar : sp.name_en} icon={sp.icon} colorIndex={i} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-800 truncate">{lang === "ar" ? sp.name_ar : sp.name_en}</div>
              <div className="text-xs text-slate-400 truncate">{lang === "ar" ? sp.title_ar : sp.title_en}</div>
            </div>
            <button onClick={() => toggleActive(sp)} title={t.toggleActive}><Pill tone={sp.active ? "green" : "gray"}>{sp.active ? t.activeLabel : t.inactiveLabel}</Pill></button>
            <button onClick={() => startEdit(sp)} className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg"><Pencil size={15} /></button>
            <button onClick={() => remove(sp.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block mb-4"><div className="text-xs font-semibold text-slate-500 mb-1.5">{label}</div>{children}</label>;
}
const inputCls = "w-full rounded-lg border border-violet-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function SpecialistForm({ t, lang, categories, value, onChange, onSave, onCancel }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const toggleCat = (id) => {
    const has = value.categoryIds.includes(id);
    onChange({ ...value, categoryIds: has ? value.categoryIds.filter((c) => c !== id) : [...value.categoryIds, id] });
  };
  return (
    <div className="bg-white rounded-2xl border border-violet-100 p-6">
      <div className="grid sm:grid-cols-2 gap-x-5">
        <Field label={t.nameEn}><input className={inputCls} value={value.name_en} onChange={set("name_en")} /></Field>
        <Field label={t.nameAr}><input className={inputCls} value={value.name_ar} onChange={set("name_ar")} /></Field>
        <Field label={t.titleEn}><input className={inputCls} value={value.title_en} onChange={set("title_en")} /></Field>
        <Field label={t.titleAr}><input className={inputCls} value={value.title_ar} onChange={set("title_ar")} /></Field>
        <Field label={t.priceField}><input className={inputCls} value={value.price} onChange={set("price")} /></Field>
        <Field label={t.orderField}><input type="number" className={inputCls} value={value.order} onChange={(e) => onChange({ ...value, order: Number(e.target.value) })} /></Field>
        <Field label={t.calendlyField}><input className={inputCls} value={value.calendly} onChange={set("calendly")} /></Field>
        <Field label={t.whatsappField}><input className={inputCls} value={value.whatsapp} onChange={set("whatsapp")} placeholder="9611234567" /></Field>
      </div>
      <Field label={t.catField}>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => toggleCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              value.categoryIds.includes(c.id) ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-violet-200 text-slate-600"
            }`}>{lang === "ar" ? c.ar : c.en}</button>
          ))}
        </div>
      </Field>
      <Field label={t.bioEn}><textarea rows={2} className={inputCls} value={value.bio_en} onChange={set("bio_en")} /></Field>
      <Field label={t.bioAr}><textarea rows={2} className={inputCls} value={value.bio_ar} onChange={set("bio_ar")} /></Field>
      <div className="flex gap-3 mt-2"><Button onClick={onSave}>{t.save}</Button><Button variant="secondary" onClick={onCancel}>{t.cancel}</Button></div>
    </div>
  );
}

function AdminCategories({ t, lang, store }) {
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const startAdd = () => { setEditing({ id: `c_${Date.now()}`, en: "", ar: "", active: true }); setIsNew(true); };
  const startEdit = (c) => { setEditing({ ...c }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };
  const save = async () => {
    const next = isNew ? [...store.categories, editing] : store.categories.map((c) => (c.id === editing.id ? editing : c));
    await store.setCategories(next);
    cancel();
  };
  const remove = async (id) => { await store.setCategories(store.categories.filter((c) => c.id !== id)); };
  const toggleActive = async (c) => { await store.setCategories(store.categories.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x))); };

  return (
    <div>
      <div className="flex justify-end mb-4"><Button onClick={startAdd}><Plus size={15} /> {t.addCategory}</Button></div>
      {editing && (
        <div className="bg-white rounded-2xl border border-violet-100 p-5 mb-4">
          <Field label={t.nameEn}><input className={inputCls} value={editing.en} onChange={(e) => setEditing({ ...editing, en: e.target.value })} /></Field>
          <Field label={t.nameAr}><input className={inputCls} value={editing.ar} onChange={(e) => setEditing({ ...editing, ar: e.target.value })} /></Field>
          <div className="flex gap-3"><Button onClick={save}>{t.save}</Button><Button variant="secondary" onClick={cancel}>{t.cancel}</Button></div>
        </div>
      )}
      <div className="space-y-2.5">
        {store.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl border border-violet-100 p-3.5">
            <div className="flex-1"><div className="font-semibold text-sm text-slate-800">{lang === "ar" ? c.ar : c.en}</div></div>
            <button onClick={() => toggleActive(c)}><Pill tone={c.active ? "green" : "gray"}>{c.active ? t.activeLabel : t.inactiveLabel}</Pill></button>
            <button onClick={() => startEdit(c)} className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg"><Pencil size={15} /></button>
            <button onClick={() => remove(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBookings({ t, lang, store }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-violet-950 mb-3">{t.recentBookings}</h3>
      {store.bookings.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">{t.noBookings}</p> : (
        <div className="space-y-3">
          {store.bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-violet-100 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-violet-950">{b.specialistName}</span>
                <span className="text-xs text-slate-400">{new Date(b.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div><b>{t.q1}:</b> {b.answers.q1}</div>
                <div><b>{t.q2}:</b> {b.answers.q2}</div>
                <div><b>{t.q3}:</b> {b.answers.q3}</div>
                {b.answers.q4 && <div><b>{t.q4}:</b> {b.answers.q4}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
