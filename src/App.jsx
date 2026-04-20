import { useState, useMemo } from "react";

const HAIR_PRICES = { 16: 165, 18: 175, 20: 185, 22: 195, 24: 200, 26: 205, 28: 215 };

const SERVICES_DATA = {
  single_weft: {
    name: "Single Weft Microlinks",
    install: 450, bundleOptions: [1], hairPriceType: "standard",
    density: "Thin / low density", result: "Flattest, most natural",
    ponytail: "✓ High ponytail", movement: "Normal", maintenance: 250, duration: "2–4 months",
    notes: "1 bundle, adds ~4 inches of length. Min. 5 inches of natural hair required.",
    requiresWait: false,
  },
  double_x: {
    name: "Double X Microlinks",
    install: { 2: 500, 3: 600 }, bundleOptions: [2, 3], hairPriceType: "standard",
    density: "Medium to thick", result: "Voluminous, flat at crown",
    ponytail: "✓ (not high)", movement: "Normal", maintenance: 250, duration: "2–4 months",
    notes: "Crown: single weft / Bottom: double weft for volume.",
    requiresWait: false,
  },
  itip: {
    name: "I-Tip Microlinks",
    install: 600, bundleOptions: [1], hairPriceType: "flat125",
    density: "Medium to thick", result: "360° natural movement",
    ponytail: "✓ High ponytail", movement: "360° free", maintenance: 450, duration: "2–4 months",
    notes: "100–200 pieces, 1.5g/strand. No glue. ⚠️ 2 weeks to receive hair.",
    requiresWait: true,
  },
  ftip: {
    name: "F-Tip Microlinks",
    install: 600, bundleOptions: [1], hairPriceType: "flat125",
    density: "Fine to medium", result: "360° movement, lightweight",
    ponytail: "✓ High ponytail", movement: "360° free", maintenance: 450, duration: "2–4 months",
    notes: "100–200 pieces, 1g/strand. No glue. ⚠️ 2 weeks to receive hair.",
    requiresWait: true,
  },
  partial: {
    name: "Partial Sew-In",
    install: { 2: 300, 3: 300, 4: 350 }, bundleOptions: [2, 3, 4], hairPriceType: "standard",
    density: "All types", result: "Protective, low maintenance",
    ponytail: "✗", movement: "Limited", maintenance: null, duration: "4–6 weeks (max 8)",
    notes: "90% hair braided. Limited scalp access.",
    requiresWait: false,
  },
  hybrid: {
    name: "Hybrid Sew-In",
    install: { 2: 350, 3: 350, 4: 400 }, bundleOptions: [2, 3, 4], hairPriceType: "standard",
    density: "All types", result: "Natural top, full bottom",
    ponytail: "✗", movement: "Moderate", maintenance: null, duration: "4–6 weeks",
    notes: "Microlinks at crown + sew-in at bottom. ~85% braided.",
    requiresWait: false,
  },
  tapein: {
    name: "Tape-In Extensions",
    install: 350, bundleOptions: [1, 2], hairPriceType: "flat125",
    density: "Medium to thick", result: "Flat, discreet, natural",
    ponytail: "✗", movement: "Natural", maintenance: null, duration: "6–8 weeks",
    notes: "Up to 80 pieces. Min. neck-length hair. ⚠️ 2 weeks to receive hair. NOT for thin or very short hair.",
    requiresWait: true,
  },
};

const ADDONS = [
  { id: "removal",      label: "Extension removal",            price: 100, cat: "🔧 Install" },
  { id: "extra_bundle", label: "Extra bundle (install)",       price: 65,  cat: "🔧 Install" },
  { id: "add_hair",     label: "Add more hair",                price: 50,  cat: "🔧 Install" },
  { id: "tangled",      label: "Extremely tangled hair",       price: 60,  cat: "🔧 Install" },
  { id: "trim",         label: "Trim ends",                    price: 25,  cat: "🔧 Install" },
  { id: "dye_natural",  label: "Dye natural hair",             price: 105, cat: "🎨 Color" },
  { id: "grey",         label: "Grey coverage (perimeter)",    price: 65,  cat: "🎨 Color" },
  { id: "color_ext",    label: "Custom color on extensions",   price: 150, cat: "🎨 Color", note: "+" },
  { id: "dye_darker",   label: "Dye extensions darker",        price: 65,  cat: "🎨 Color", note: "/bundle" },
  { id: "highlights",   label: "Highlights / Balayage",        price: 150, cat: "🎨 Color", note: "+" },
  { id: "keratin",      label: "Keratin (Aminoplasty)",        price: 350, cat: "💆 Treatment", note: "+" },
  { id: "deep_cond",    label: "Deep Conditioning",            price: 30,  cat: "💆 Treatment" },
  { id: "squeeze_in",   label: "Squeeze-in appointment",       price: 100, cat: "⭐ Other" },
  { id: "home_service", label: "In-home service fee",          price: 200, cat: "⭐ Other" },
];

const CALL_STEPS = [
  { label: "Open & let the client lead", time: "1–2 min",
    script: '"Hi [Name], this is [Your name] from Lavish Hair Line. How are you today? … How can I assist you today?"',
    note: "Do NOT interrupt. Listen for key details." },
  { label: "NJ or TX?", time: "",
    script: '"Are you inquiring about our New Jersey or Texas location?"',
    note: "NJ = Nairovis · TX = Verolisa (owner)" },
  { label: "Transition to expert mode", time: "",
    script: '"Thank you for sharing that. I\'m going to ask a few quick questions so I can recommend the best option for you."',
    note: "" },
  { label: "Qualify", time: "5–7 min",
    script: "See QUALIFY tab → ask only what they didn't already answer.",
    note: "Length · Density · Style · Goal · Maintenance · Color · Budget" },
  { label: "Ask budget", time: "",
    script: '"Before I recommend the best option, do you have a budget in mind?"',
    note: "PAUSE — let them answer first." },
  { label: "Recommend with confidence", time: "",
    script: '"Based on what you shared, I would recommend [SERVICE + TEXTURE]. This will give you a very natural, seamless result while keeping your natural hair healthy."',
    note: "See SERVICES tab for quick guide." },
  { label: "Calculate estimate", time: "",
    script: '"Give me a quick moment, I\'m going to do some math…" (2–3 sec pause) "Your estimated investment would be around $[RANGE]."',
    note: "Use PRICE tab. Always give a range. Never underquote." },
  { label: "Qualify the budget", time: "",
    script: "If their budget was lower → \"Do you feel like you'd be able to stretch that a bit to move forward?\" (PAUSE)",
    note: "Yes → close. No → professional, respectful exit." },
  { label: "Close (assumptive)", time: "",
    script: '"The next step would be booking your consultation. I have availability on [Day A] or [Day B]—which works best?"',
    note: "Never ask 'Do you want to book?' → assume they are moving forward." },
  { label: "Send consultation link", time: "",
    script: '"I\'m going to send you the consultation link right now. Our books do fill up quickly, so I recommend booking as soon as possible to secure your spot."',
    note: "Send via text WHILE on the call." },
  { label: "Final confirmation", time: "",
    script: '"Once you book, you\'ll receive an email confirmation with all the details."',
    note: "" },
  { label: "Close the call", time: "",
    script: '"It was a pleasure speaking with you, [Name]. We look forward to working with you ✨"',
    note: "" },
];

const QUALIFY_QS = [
  { q: "How long is your hair when it's straight?", icon: "📏",
    note: "Min. 5 inches for microlinks. Chin-length in front for I/F-Tips. Neck-length for tape-ins." },
  { q: "Would you say your hair is thin, medium, or thick?", icon: "💆",
    note: "Guides the service: thin → single weft / F-tip · medium-thick → double X, I-tip, tape-in" },
  { q: "Do you usually wear your hair straight or curly?", icon: "🌀",
    note: "Defines the texture to recommend." },
  { q: "Are you looking for more volume, length, or both?", icon: "✨",
    note: "Defines number of bundles and technique." },
  { q: "Are you able to come in every 4–6 weeks for maintenance?", icon: "📅",
    note: "Microlinks: maintenance $250 (single/double) or $450 (I/F-tip). Sew-in & tape-in: remove and reinstall." },
  { q: "Do you need any color services? Highlights, grey coverage?", icon: "🎨",
    note: "Always ask — it elevates the final look. We recommend highlights on extensions, not natural hair, to protect it." },
  { q: "Do you have a budget in mind?", icon: "💰",
    note: "If they ask price first → 'Our services start at $650 with hair included.' Qualify first." },
];

const SERVICE_MATCH = [
  { cond: "Thin / low density hair",                          svc: "Single Weft Microlinks",  color: "#c9a84c" },
  { cond: "Medium to thick hair + wants volume",              svc: "Double X Microlinks",      color: "#b07de8" },
  { cond: "Wants max movement (360°), fine–medium hair",      svc: "F-Tip Microlinks",         color: "#7eb8ff" },
  { cond: "Wants max movement (360°), medium–thick hair",     svc: "I-Tip Microlinks",         color: "#7eb8ff" },
  { cond: "Doesn't want all hair out / wants versatility",    svc: "Hybrid Sew-In",            color: "#90ffb4" },
  { cond: "Protective style / lower budget",                  svc: "Partial Sew-In",           color: "#ffa07a" },
  { cond: "Medium–thick, wants flat & discreet look",         svc: "Tape-In Extensions",       color: "#ffcc70" },
];

const TEXTURES = [
  { cond: "Wears hair straight all the time",                               rec: "Body Wave or Spanish Wave" },
  { cond: "4C hair but straightens it often",                               rec: "Kinky Straight" },
  { cond: "Doesn't like the look of kinky straight",                        rec: "Body Wave or Spanish Wave" },
  { cond: "Wants it to look like it's growing out of the scalp (curly)",    rec: "Kinky Curly / Coily Curly / Indian Curly" },
  { cond: "Wants something super natural and lightweight",                   rec: "Closest curl pattern match or Body Wave" },
  { cond: "Wants volume and definition in curls",                           rec: "Tight Curly or Coily Curly" },
];

const OBJECTIONS = [
  { trigger: '"It\'s expensive" / "I need to think about it"',
    response: '"I understand. Our focus is really on quality, longevity, and protecting your natural hair—so you\'re investing in a result that looks natural and lasts."',
    followup: "If they're still hesitating → 'Our books do fill up quickly. I recommend securing your spot—we can always adjust the details during your consultation.'" },
  { trigger: '"I only had a budget of $X" (well below estimate)',
    response: '"Do you feel like you\'d be able to stretch that a bit to move forward?"',
    followup: "If no → 'Whenever you feel ready, we'd be more than happy to assist you.' End the call professionally." },
  { trigger: '"I\'m not sure which one to choose"',
    response: '"That\'s completely normal—that\'s exactly what the consultation is for. We\'ll fully customize everything to you when you come in."',
    followup: "→ Book the consultation directly." },
  { trigger: '"How much does it cost?" (immediate)',
    response: '"Great question. Pricing varies depending on the technique, length, and color. Do you have a budget in mind? That helps me recommend the best option for you."',
    followup: "If they insist: 'Our services start at $650 with hair extensions included.'" },
  { trigger: '"I only have a few minutes"',
    response: '"No problem at all—I\'ll keep this quick. Let me ask 2–3 key questions so I can point you in the right direction."',
    followup: "2–3 key questions → recommend → schedule." },
  { trigger: '"I want really long hair but only one bundle"',
    response: '"To achieve that look properly, I\'d recommend at least [X] bundles so it doesn\'t look thin at the ends. Our goal is to make sure it looks full and natural, not stringy."',
    followup: "Reposition expectations professionally. Never underquote to close." },
  { trigger: "Client asks for wigs / closures / quick weaves / frontals",
    response: '"We actually specialize in microlinks and hybrid installs, which give a more natural, scalp-access look. Based on what you\'re looking for, I can recommend a technique that gives you a similar result."',
    followup: "NEVER offer what we don't do. Always redirect." },
];

const POLICIES = [
  { title: "Consultation",           detail: "$50 — Applied toward the total if client moves forward. Lasts 30 minutes." },
  { title: "Deposit",                detail: "Non-refundable and non-transferable." },
  { title: "Cancellation / Reschedule", detail: "Must be done 48 hours prior. Within 48h → deposit is forfeited. Before 48h → store credit. Max 1–2 reschedules per appointment." },
  { title: "Tardiness",              detail: "10-minute grace period. 20+ min late and still accommodated → $50 late fee." },
  { title: "Post-service adjustments", detail: "Client has 7 days to report issues. 1 complimentary adjustment. Additional changes are charged accordingly." },
  { title: "Refunds",                detail: "We do NOT offer refunds. If a client asks → escalate to Verolisa IMMEDIATELY. Do not make any promises." },
  { title: "Parking – NJ",           detail: "Free behind the building. White lines = no limit. Yellow lines = 2-hour limit." },
  { title: "Parking – TX",           detail: "Ample parking available. No restrictions." },
];

const TREATMENTS = [
  { name: "Keratin / Aminoplasty",  price: "$350+", freq: "Every 3 months",
    desc: "Adds protein, removes frizz, makes blowdrying easier. Does NOT thin or straighten hair. Strengthens strands." },
  { name: "Relaxer",                price: "$105",  freq: "Every 3 months",
    desc: "Permanently straightens hair. Thins the strand. NOT needed if wearing extensions." },
  { name: "Deep Conditioning",      price: "$30",   freq: "Min. every 2 weeks",
    desc: "Deep moisture treatment. Essential for hair and extension health. Basic maintenance must-have." },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Figtree:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#09051a}
.app{font-family:'Figtree',sans-serif;background:#09051a;color:#e4d4f7;min-height:100vh;font-size:14px;overflow-x:hidden}
.hdr{background:linear-gradient(160deg,#12072b 0%,#1f0e45 80%,#160a32 100%);padding:24px max(24px, calc(50vw - 450px)) 0;border-bottom:1px solid rgba(201,168,76,.25);position:sticky;top:0;z-index:99;box-shadow:0 15px 40px -10px rgba(0,0,0,0.7);backdrop-filter:blur(10px)}
.brand{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#c9a84c;letter-spacing:3.5px;text-transform:uppercase}
.sub{font-size:10px;color:#8a6caa;letter-spacing:2px;text-transform:uppercase;margin-top:2px}
.tabs{display:flex;overflow-x:auto;gap:4px;margin-top:16px;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.t{padding:10px 14px;font-size:11.5px;color:#7a5c9a;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .3s ease;background:none;border-top:none;border-left:none;border-right:none;font-family:'Figtree',sans-serif;letter-spacing:.5px;border-radius:6px 6px 0 0}
.t.on{color:#c9a84c;border-bottom-color:#c9a84c;background:rgba(201,168,76,.05)}
.t:hover:not(.on){color:#d4c4e8;background:rgba(255,255,255,.03)}
.body{max-width:900px;margin:0 auto;padding:28px 24px 60px}
.stitle{font-family:'Cormorant Garamond',serif;font-size:19px;color:#c9a84c;margin-bottom:14px;font-weight:500;letter-spacing:.5px}
.card{background:rgba(31,14,69,.45);border:1px solid rgba(201,168,76,.18);border-radius:8px;padding:14px;margin-bottom:10px}
.ctitle{font-family:'Cormorant Garamond',serif;font-size:15px;color:#e4d4f7;font-weight:600;margin-bottom:6px}
.gold{color:#c9a84c}
.lav{color:#b07de8}
.muted{color:#7a5c9a;font-size:12px}
.step{display:flex;gap:10px;margin-bottom:12px;align-items:flex-start}
.snum{background:linear-gradient(135deg,#c9a84c,#debb6a);color:#09051a;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.scontent{flex:1}
.slabel{font-size:13.5px;color:#e4d4f7;font-weight:500}
.stime{font-size:10px;color:#8a6caa;margin-left:6px}
.sscript{font-size:12px;color:#b07de8;font-style:italic;background:rgba(176,125,232,.1);border-left:2px solid #b07de8;padding:5px 8px;border-radius:0 4px 4px 0;margin-top:5px;line-height:1.5}
.snote{font-size:11px;color:#7a5c9a;margin-top:4px}
.qitem{padding:9px 0;border-bottom:1px solid rgba(201,168,76,.1)}
.qitem:last-child{border-bottom:none}
.qtop{display:flex;gap:8px;align-items:flex-start}
.qico{font-size:15px;flex-shrink:0;margin-top:1px}
.qtext{font-size:13.5px;color:#e4d4f7;line-height:1.4}
.qnote{font-size:11.5px;color:#7a5c9a;margin-top:3px;margin-left:23px}
.match-grid{display:grid;gap:7px}
.match-row{display:flex;align-items:center;gap:10px;padding:9px 12px;background:rgba(31,14,69,.4);border-radius:6px;border:1px solid rgba(201,168,76,.1)}
.match-cond{font-size:12.5px;color:#c0a8d8;flex:1}
.match-svc{font-size:12.5px;font-weight:600;flex-shrink:0}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media(max-width:580px){.sgrid{grid-template-columns:1fr}}
.scard{background:rgba(31,14,69,.4);border:1px solid rgba(201,168,76,.14);border-radius:8px;padding:12px}
.sname{font-family:'Cormorant Garamond',serif;font-size:14px;color:#c9a84c;font-weight:600;margin-bottom:5px}
.spr{font-size:18px;color:#e4d4f7;font-weight:600;margin-bottom:4px}
.bdg{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;margin:2px 2px 0 0}
.bd{background:rgba(176,125,232,.2);color:#b07de8}
.bg{background:rgba(201,168,76,.15);color:#c9a84c}
.bw{background:rgba(255,140,100,.15);color:#ff9878}
.clbl{font-size:11px;color:#7a5c9a;letter-spacing:.8px;text-transform:uppercase;margin-bottom:7px;margin-top:16px}
.clbl:first-child{margin-top:0}
.sel{width:100%;background:rgba(31,14,69,.6);border:1px solid rgba(201,168,76,.3);color:#e4d4f7;padding:9px 12px;border-radius:6px;font-size:13.5px;font-family:'Figtree',sans-serif;cursor:pointer;appearance:none}
.sel:focus{outline:none;border-color:#c9a84c}
.rbg{display:flex;flex-wrap:wrap;gap:7px}
.rb{padding:7px 12px;border:1px solid rgba(201,168,76,.25);border-radius:16px;font-size:12.5px;color:#7a5c9a;cursor:pointer;transition:all .2s;background:none;font-family:'Figtree',sans-serif}
.rb.on{background:rgba(201,168,76,.18);border-color:#c9a84c;color:#c9a84c}
.cklist{display:grid;grid-template-columns:1fr 1fr;gap:5px}
@media(max-width:500px){.cklist{grid-template-columns:1fr}}
.ck{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(201,168,76,.12);border-radius:6px;cursor:pointer;font-size:12px;color:#7a5c9a;transition:all .2s;user-select:none}
.ck.on{background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.35);color:#e4d4f7}
.ckbox{width:14px;height:14px;border:1px solid rgba(201,168,76,.35);border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px}
.ck.on .ckbox{background:#c9a84c;color:#09051a}
.tbox{background:linear-gradient(135deg,rgba(31,14,69,.9),rgba(9,5,26,.95));border:1px solid #c9a84c;border-radius:10px;padding:20px;text-align:center;margin-top:16px}
.tlbl{font-size:10px;color:#7a5c9a;letter-spacing:2px;text-transform:uppercase}
.tamt{font-size:38px;color:#c9a84c;font-family:'Cormorant Garamond',serif;font-weight:600;margin:4px 0 2px}
.tbk{font-size:12px;color:#7a5c9a}
.trow{display:flex;justify-content:space-between;padding:3px 0}
.tdiv{border:none;border-top:1px solid rgba(201,168,76,.2);margin:8px 0}
.colrow{padding:9px 0;border-bottom:1px solid rgba(201,168,76,.1)}
.colrow:last-child{border-bottom:none}
.colname{font-size:13px;color:#e4d4f7;font-weight:500}
.colpr{color:#c9a84c;font-size:13px;font-weight:600;margin-left:6px}
.coldesc{font-size:11.5px;color:#7a5c9a;margin-top:2px}
.ob{margin-bottom:14px;padding:12px 14px;background:rgba(31,14,69,.4);border-radius:8px;border:1px solid rgba(201,168,76,.12)}
.obtrig{font-size:12.5px;color:#c9a84c;font-weight:500;margin-bottom:7px}
.obsc{font-size:12.5px;color:#b07de8;font-style:italic;background:rgba(176,125,232,.1);border-left:2px solid #b07de8;padding:5px 8px;border-radius:0 4px 4px 0;line-height:1.5;margin-bottom:5px}
.obfu{font-size:11.5px;color:#7a5c9a}
.polrow{padding:10px 0;border-bottom:1px solid rgba(201,168,76,.1)}
.polrow:last-child{border-bottom:none}
.poltitle{font-size:13px;color:#c9a84c;font-weight:600;margin-bottom:2px}
.poldesc{font-size:12.5px;color:#c0a8d8;line-height:1.5}
.hbox{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.28);border-radius:6px;padding:11px 13px;margin-bottom:14px;font-size:12.5px;color:#c9a84c;line-height:1.5}
.trow2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:500px){.trow2{grid-template-columns:1fr}}
.treat{padding:11px 12px;background:rgba(31,14,69,.4);border:1px solid rgba(201,168,76,.14);border-radius:7px}
.tname{font-size:13px;color:#e4d4f7;font-weight:600;margin-bottom:3px}
.tprice{color:#c9a84c;font-size:13px;font-weight:600}
.tfreq{font-size:11px;color:#7a5c9a;margin-left:6px}
.tdesc{font-size:11.5px;color:#8a7aaa;margin-top:4px;line-height:1.4}
.divider{border:none;border-top:1px solid rgba(201,168,76,.12);margin:14px 0}
.nolist{background:rgba(255,80,80,.08);border:1px solid rgba(255,80,80,.25);border-radius:6px;padding:10px 13px}
.noitem{font-size:12.5px;color:#ff9878;padding:3px 0}
`;

function getInstallLabelFor(s) {
  if (typeof s.install === "object") {
    return Object.entries(s.install).map(([k, v]) => `$${v}(${k}b)`).join(" / ");
  }
  return `$${s.install}`;
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [selSvc, setSelSvc] = useState("double_x");
  const [numB, setNumB] = useState(2);
  const [hairLen, setHairLen] = useState(18);
  const [selAddons, setSelAddons] = useState([]);

  const svc = SERVICES_DATA[selSvc];

  const installPrice = useMemo(() => {
    if (!svc) return 0;
    if (typeof svc.install === "object") {
      return svc.install[numB] || Object.values(svc.install)[0];
    }
    return svc.install;
  }, [svc, numB]);

  const effectiveBundles = svc?.bundleOptions.length === 1 ? 1 : numB;

  const hairPrice = useMemo(() => {
    if (!svc) return 0;
    if (svc.hairPriceType === "flat125") return 125 * effectiveBundles;
    return (HAIR_PRICES[hairLen] || 0) * effectiveBundles;
  }, [svc, numB, hairLen, effectiveBundles]);

  const addonsTotal = useMemo(() =>
    selAddons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0), 0)
  , [selAddons]);

  const subtotal = installPrice + hairPrice + addonsTotal;
  const total = subtotal + 50;

  const toggleAddon = (id) =>
    setSelAddons(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const TLABELS = ["📞 Call Flow", "✅ Qualify", "💇 Services", "💰 Price", "🎨 Color", "💬 Objections", "📋 Policies"];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="hdr">
          <div className="brand">LAVISH HAIR LINE</div>
          <div className="sub">VA Quick Reference · 15-Min Consultations</div>
          <div className="tabs">
            {TLABELS.map((l, i) => (
              <button key={i} className={`t ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="body">

          {/* ── TAB 0: CALL FLOW ── */}
          {tab === 0 && <>
            <div className="stitle">Call Flow</div>
            <div className="hbox">
              💡 Golden rule: Every conversation leads to a call · Every call leads to a consultation · Always guide to the next step.
            </div>
            {CALL_STEPS.map((s, i) => (
              <div className="step" key={i}>
                <div className="snum">{i + 1}</div>
                <div className="scontent">
                  <span className="slabel">{s.label}</span>
                  {s.time && <span className="stime">({s.time})</span>}
                  <div className="sscript">{s.script}</div>
                  {s.note && <div className="snote">→ {s.note}</div>}
                </div>
              </div>
            ))}
          </>}

          {/* ── TAB 1: QUALIFY ── */}
          {tab === 1 && <>
            <div className="stitle">Qualification Questions</div>
            <div className="card">
              {QUALIFY_QS.map((q, i) => (
                <div className="qitem" key={i}>
                  <div className="qtop">
                    <div className="qico">{q.icon}</div>
                    <div className="qtext">{q.q}</div>
                  </div>
                  <div className="qnote">{q.note}</div>
                </div>
              ))}
            </div>

            <div className="stitle" style={{ marginTop: 20 }}>Client Profile → Recommended Service</div>
            <div className="match-grid">
              {SERVICE_MATCH.map((m, i) => (
                <div className="match-row" key={i}>
                  <div className="match-cond">{m.cond}</div>
                  <div style={{ color: "#4a3a6a", fontSize: 12, flexShrink: 0 }}>→</div>
                  <div className="match-svc" style={{ color: m.color }}>{m.svc}</div>
                </div>
              ))}
            </div>

            <div className="stitle" style={{ marginTop: 20 }}>Texture Guide</div>
            <div className="card">
              {TEXTURES.map((t, i) => (
                <div className="qitem" key={i}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "#c0a8d8", flex: 1 }}>"{t.cond}"</div>
                    <div style={{ fontSize: 13, color: "#c9a84c", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>→ {t.rec}</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ── TAB 2: SERVICES ── */}
          {tab === 2 && <>
            <div className="stitle">Available Services</div>
            <div className="sgrid">
              {Object.entries(SERVICES_DATA).map(([id, s]) => (
                <div className="scard" key={id}>
                  <div className="sname">{s.name}</div>
                  <div className="spr">{getInstallLabelFor(s)} <span style={{ fontSize: 12, color: "#7a5c9a", fontWeight: 400 }}>install</span></div>
                  <span className="bdg bd">{s.density}</span>
                  <span className="bdg bg">{s.ponytail}</span>
                  {s.requiresWait && <span className="bdg bw">⏱ 2-week wait</span>}
                  <div style={{ marginTop: 6, fontSize: 12, color: "#8a7aaa", lineHeight: 1.4 }}>{s.notes}</div>
                  {s.maintenance
                    ? <div style={{ marginTop: 5, fontSize: 11.5, color: "#c9a84c" }}>Maintenance: ${s.maintenance} · {s.duration}</div>
                    : <div style={{ marginTop: 5, fontSize: 11.5, color: "#7a5c9a" }}>Duration: {s.duration}</div>
                  }
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="stitle">Hair Bundle Pricing by Length</div>
              <div className="card">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(HAIR_PRICES).map(([l, p]) => (
                    <div key={l} style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 6, padding: "6px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#7a5c9a" }}>{l}"</div>
                      <div style={{ fontSize: 14, color: "#c9a84c", fontWeight: 600 }}>${p}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 11.5, color: "#7a5c9a" }}>
                  I-Tip / F-Tip / Tape-In → $125 per set (flat price, regardless of length)<br />
                  1 bundle = light · 2 = standard · 3 = full · 4 = glam
                </div>
              </div>
            </div>

            <div className="stitle" style={{ marginTop: 14 }}>What We Do NOT Offer</div>
            <div className="nolist">
              {["Wig installs", "Closure installs (only for alopecia clients under Verolisa)", "Frontal installs", "Quick weaves", "Glue-based installs", "Knotless braids"].map((x, i) => (
                <div className="noitem" key={i}>✗ {x}</div>
              ))}
            </div>
          </>}

          {/* ── TAB 3: PRICE ── */}
          {tab === 3 && <>
            <div className="stitle">Price Calculator</div>
            <div className="hbox">📐 Formula: Install + Hair + Add-ons + $50 buffer = Total Estimate</div>

            <div className="clbl">1. Service</div>
            <select className="sel" value={selSvc} onChange={e => { setSelSvc(e.target.value); setNumB(SERVICES_DATA[e.target.value].bundleOptions[0]); }}>
              {Object.entries(SERVICES_DATA).map(([id, s]) => (
                <option key={id} value={id}>{s.name}</option>
              ))}
            </select>
            {svc && <div style={{ fontSize: 11.5, color: "#7a5c9a", marginTop: 5 }}>Install: {getInstallLabelFor(svc)} · {svc.density}</div>}

            {svc && svc.bundleOptions.length > 1 && <>
              <div className="clbl">2. Number of Bundles</div>
              <div className="rbg">
                {svc.bundleOptions.map(b => (
                  <button key={b} className={`rb ${numB === b ? "on" : ""}`} onClick={() => setNumB(b)}>{b} bundles</button>
                ))}
              </div>
            </>}

            {svc && svc.hairPriceType === "standard" && <>
              <div className="clbl">3. Hair Length</div>
              <div className="rbg">
                {Object.keys(HAIR_PRICES).map(l => (
                  <button key={l} className={`rb ${hairLen === Number(l) ? "on" : ""}`} onClick={() => setHairLen(Number(l))}>{l}"</button>
                ))}
              </div>
            </>}

            {svc && svc.hairPriceType === "flat125" && <>
              <div className="clbl">3. Hair Price</div>
              <div style={{ fontSize: 13, color: "#c9a84c", padding: "8px 0" }}>$125 per set (flat rate for {svc.name})</div>
            </>}

            <div className="clbl">4. Add-ons</div>
            {["🔧 Install", "🎨 Color", "💆 Treatment", "⭐ Other"].map(cat => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#5a4a7a", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{cat}</div>
                <div className="cklist">
                  {ADDONS.filter(a => a.cat === cat).map(a => (
                    <div key={a.id} className={`ck ${selAddons.includes(a.id) ? "on" : ""}`} onClick={() => toggleAddon(a.id)}>
                      <div className="ckbox">{selAddons.includes(a.id) ? "✓" : ""}</div>
                      <span style={{ flex: 1 }}>{a.label}</span>
                      <span style={{ color: selAddons.includes(a.id) ? "#c9a84c" : "#5a4a7a", flexShrink: 0, marginLeft: 4 }}>${a.price}{a.note || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="tbox">
              <div className="tlbl">Estimated Investment</div>
              <div className="tamt">${total.toLocaleString()}</div>
              <div className="tbk">
                <div className="trow"><span>Install</span><span className="gold">${installPrice}</span></div>
                <div className="trow">
                  <span>Hair ({svc?.hairPriceType === "flat125" ? `$125/set` : `${effectiveBundles}b × $${HAIR_PRICES[hairLen] || 0}`})</span>
                  <span className="gold">${hairPrice}</span>
                </div>
                {addonsTotal > 0 && <div className="trow"><span>Add-ons</span><span className="gold">${addonsTotal}</span></div>}
                <div className="tdiv" />
                <div className="trow"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="trow"><span>Buffer (+$50)</span><span className="gold">+$50</span></div>
                <div className="tdiv" />
                <div className="trow" style={{ fontWeight: 600, fontSize: 14 }}><span>Total Estimate</span><span className="gold">${total.toLocaleString()}</span></div>
              </div>
              <div style={{ fontSize: 11, color: "#5a4a7a", marginTop: 10 }}>Always give a range — e.g. "around ${subtotal}–${total}"</div>
            </div>
          </>}

          {/* ── TAB 4: COLOR ── */}
          {tab === 4 && <>
            <div className="stitle">Color Services</div>
            <div className="hbox">
              💡 Anything you can do to natural hair, you can do to extensions.
              We recommend highlights on extensions, NOT on natural hair — to protect it.
            </div>

            <div className="card">
              <div style={{ fontSize: 12, color: "#7a5c9a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🎨 Available Colors (Extensions)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {[["1", "Black"], ["1B/2", "Soft Black"], ["3", "Dark Brown"], ["4", "Light Brown"]].map(([n, l]) => (
                  <div key={n} style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#c9a84c" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "#c0a8d8" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#7a5c9a" }}>
                No dye → extension hair naturally creates a soft ombré effect when blended with 1B/2 hair.
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 12, color: "#7a5c9a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Color Services — Pricing</div>
              {[
                { n: "Custom color on extensions",       p: "$150+ /bundle" },
                { n: "Dye extensions darker",            p: "$65 /bundle" },
                { n: "Highlights (on extensions)",       p: "$150+" },
                { n: "Balayage (on extensions)",         p: "$150+" },
                { n: "Dye natural hair",                 p: "$105" },
                { n: "Grey coverage (perimeter)",        p: "$65" },
                { n: "Color correction",                 p: "$350+ (with consultation)", warn: true },
              ].map((c, i) => (
                <div className="colrow" key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="colname">{c.n}</span>
                    <span className={`colpr ${c.warn ? "lav" : ""}`}>{c.p}</span>
                  </div>
                  {c.warn && <div style={{ fontSize: 11, color: "#b07de8" }}>→ Escalate to Verolisa</div>}
                </div>
              ))}
            </div>

            <div className="stitle" style={{ marginTop: 16 }}>Treatments</div>
            <div className="trow2">
              {TREATMENTS.map((t, i) => (
                <div className="treat" key={i}>
                  <div className="tname">{t.name}</div>
                  <span className="tprice">{t.price}</span>
                  <span className="tfreq">{t.freq}</span>
                  <div className="tdesc">{t.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: "#7a5c9a", lineHeight: 1.6 }}>
              <strong style={{ color: "#c9a84c" }}>Keratin ≠ Relaxer:</strong> A relaxer straightens and thins the strand. Keratin strengthens and removes frizz. For extensions, keratin is recommended — a relaxer is not needed.
            </div>
          </>}

          {/* ── TAB 5: OBJECTIONS ── */}
          {tab === 5 && <>
            <div className="stitle">Objection Handling</div>
            {OBJECTIONS.map((o, i) => (
              <div className="ob" key={i}>
                <div className="obtrig">🔴 {o.trigger}</div>
                <div className="obsc">"{o.response.replace(/^"|"$/g, "")}"</div>
                {o.followup && <div className="obfu">→ {o.followup}</div>}
              </div>
            ))}

            <div className="divider" />
            <div className="stitle">3-Touch Follow-Up (if they don't book)</div>
            <div className="card">
              {[
                { day: "Day 1 — 24 hours later",    msg: '"Hi love, just checking in to see if you had a chance to book your consultation. Let me know if you need help with scheduling or have any questions."' },
                { day: "Day 3",                     msg: '"Hi love! I wanted to follow up and see if you\'re still interested in moving forward. I\'d love to help you get scheduled and bring your hair goals to life ✨"' },
                { day: "Day 7 — Final follow-up",   msg: '"Hi love, just checking in one last time 😊 If you\'re still interested, I\'d be happy to help you get booked. Whenever you\'re ready, we\'re here for you."' },
              ].map((f, i) => (
                <div className="qitem" key={i}>
                  <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 600, marginBottom: 4 }}>{f.day}</div>
                  <div className="obsc">{f.msg}</div>
                </div>
              ))}
            </div>
          </>}

          {/* ── TAB 6: POLICIES ── */}
          {tab === 6 && <>
            <div className="stitle">Policies & Terms</div>
            <div className="card">
              {POLICIES.map((p, i) => (
                <div className="polrow" key={i}>
                  <div className="poltitle">{p.title}</div>
                  <div className="poldesc">{p.detail}</div>
                </div>
              ))}
            </div>

            <div className="stitle" style={{ marginTop: 14 }}>Locations</div>
            <div className="trow2">
              <div className="card">
                <div className="ctitle">📍 New Jersey</div>
                <div style={{ fontSize: 13, color: "#c0a8d8", lineHeight: 1.7 }}>
                  Stylist: <strong className="gold">Nairovis</strong><br />
                  1143 Main Ave, Clifton, NJ 07011<br />
                  Inside: NU Magazine Hair Spa<br />
                  <span className="muted">Parking: White lines behind building</span>
                </div>
              </div>
              <div className="card">
                <div className="ctitle">📍 Frisco, Texas</div>
                <div style={{ fontSize: 13, color: "#c0a8d8", lineHeight: 1.7 }}>
                  Stylist: <strong className="gold">Verolisa (Owner)</strong><br />
                  7410 Preston Rd Suite 119<br />Frisco, TX 75034<br />
                  Inside: Image Studio 360<br />
                  <span className="muted">Parking: No restrictions</span>
                </div>
              </div>
            </div>

            <div className="stitle" style={{ marginTop: 14 }}>Software & Contact</div>
            <div className="card" style={{ fontSize: 12.5, color: "#c0a8d8", lineHeight: 2 }}>
              🌐 Website: <span className="gold">www.lavishhairline.com</span><br />
              📱 Instagram: <span className="gold">@createdbylavish</span><br />
              📅 Acuity Scheduling: <span className="gold">shorturl.at/L8089</span><br />
              📞 Phone (Ooma): <span className="gold">(862) 658-7707</span>
            </div>

            <div className="hbox" style={{ marginTop: 14 }}>
              🚨 Escalation rule: Color correction · Complaints · Refund requests · Hair loss / medical concerns · Pricing disputes → escalate to Verolisa ALWAYS. Do not make promises.
            </div>
          </>}

        </div>
      </div>
    </>
  );
}
