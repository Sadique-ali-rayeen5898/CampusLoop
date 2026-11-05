import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'campusloop-simulator-v2';

const starterListings = [
  { id: 'p1', title: 'Casio FX-991ES Plus', category: 'Calculators', subcategory: 'Scientific calculators', sellerPersonality: 'friendly', condition: 'Very good', price: 950, minPrice: 750, description: 'Fully functional scientific calculator. Light signs of use, fresh battery, and original cover included.', mode: 'sell-barter', owner: 'Aarav Mehta', ownerId: 'u2', campus: 'CMR University', location: 'Lakeside Campus, Block A', aiEnabled: true, negotiable: true, wants: 'Engineering textbook or cash difference', icon: '⌗', color: 'blue', created: '2 hours ago', status: 'active' },
  { id: 'p2', title: 'Engineering Mathematics Textbook', category: 'Books', subcategory: 'Mathematics', sellerPersonality: 'firm', condition: 'Good', price: 320, minPrice: 250, description: 'Useful for first and second year engineering mathematics. No missing pages, some highlighting.', mode: 'sell-barter', owner: 'Diya Nair', ownerId: 'u3', campus: 'CMR University', location: 'Hostel Block C', aiEnabled: true, negotiable: true, wants: 'Calculator or another academic book', icon: '▤', color: 'amber', created: 'Yesterday', status: 'active' },
  { id: 'p3', title: 'Logitech M221 Wireless Mouse', category: 'Electronics', subcategory: 'Computer accessories', sellerPersonality: 'blunt', condition: 'Like new', price: 550, minPrice: 450, description: 'Quiet wireless mouse. USB receiver included. Used for one semester.', mode: 'sell', owner: 'Kabir Shah', ownerId: 'u4', campus: 'CMR University', location: 'Library', aiEnabled: true, negotiable: true, wants: 'Cash', icon: '◉', color: 'violet', created: '3 hours ago', status: 'active' },
  { id: 'p4', title: 'Scientific Calculator Rental', category: 'Calculators', subcategory: 'Scientific calculators', sellerPersonality: 'friendly', condition: 'Good', price: 0, minPrice: 0, description: 'Reliable calculator available for short-term exam use. Pickup and return on campus.', mode: 'rent', owner: 'Ishita Rao', ownerId: 'u5', campus: 'CMR University', location: 'Hostel Block B', aiEnabled: false, negotiable: false, wants: '', icon: '⌗', color: 'blue', created: 'Today', status: 'active', rentPrice: 35, deposit: 200, rentUnit: 'day' },
  { id: 'p5', title: 'USB-C Hub, 6-in-1', category: 'Electronics', subcategory: 'Cables & adapters', sellerPersonality: 'urgent', condition: 'Good', price: 700, minPrice: 550, description: 'HDMI, USB-A, USB-C PD, and SD card reader. Works perfectly.', mode: 'sell-barter', owner: 'Rohan Das', ownerId: 'u6', campus: 'CMR University', location: 'Main Building', aiEnabled: true, negotiable: true, wants: 'Headphones or cash', icon: '⌘', color: 'green', created: '2 days ago', status: 'active' },
  { id: 'p6', title: 'Drawing Board and Mini-Drafter', category: 'Stationery', subcategory: 'Drawing & geometry', sellerPersonality: 'practical', condition: 'Good', price: 450, minPrice: 350, description: 'Compact drawing board set. Ideal for engineering graphics practice.', mode: 'sell', owner: 'Meera Kapoor', ownerId: 'u7', campus: 'CMR University', location: 'Design Studio', aiEnabled: true, negotiable: true, wants: 'Cash', icon: '▱', color: 'rose', created: '4 hours ago', status: 'active' },
  { id: 'p7', title: 'Laptop Stand', category: 'Hostel Essentials', subcategory: 'Study furniture', sellerPersonality: 'friendly', condition: 'Like new', price: 300, minPrice: 220, description: 'Foldable aluminium stand with adjustable height. Easy to carry.', mode: 'sell-barter', owner: 'Aditya Jain', ownerId: 'u8', campus: 'CMR University', location: 'Hostel Block A', aiEnabled: false, negotiable: true, wants: 'Desk lamp or cash', icon: '▰', color: 'green', created: 'Today', status: 'active' },
  { id: 'p8', title: 'DSA Reference Book', category: 'Books', subcategory: 'Computer science', sellerPersonality: 'collector', condition: 'Acceptable', price: 180, minPrice: 120, description: 'A useful reference for data structures and algorithms. Some notes in pencil.', mode: 'sell-barter', owner: 'Zoya Khan', ownerId: 'u9', campus: 'CMR University', location: 'Library', aiEnabled: true, negotiable: true, wants: 'Another CS book', icon: '▤', color: 'amber', created: 'Yesterday', status: 'active' }
];

const starterState = {
  currentUser: { id: 'u1', name: 'You', initials: 'YO', campus: 'CMR University', course: 'B.Tech CSE' },
  listings: starterListings,
  negotiations: [],
  messages: [],
  rentals: [],
  orders: [],
  saved: ['p1', 'p4'],
  notifications: [
    { id: 'n1', title: 'Welcome to CampusLoop', text: 'Explore the demo marketplace. All activity is simulated.', time: 'Just now', unread: true },
    { id: 'n2', title: 'AI negotiation is ready', text: 'Try the AI assistant on a listing with bargaining enabled.', time: 'Just now', unread: true }
  ]
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterState;
    const restored = { ...starterState, ...JSON.parse(stored) };
    const migratedDeals = [];
    const ownedListings = (restored.listings || []).filter((item) => item.ownerId === restored.currentUser.id && item.mode !== 'rent' && item.status === 'active');
    ownedListings.forEach((item, index) => {
      const alreadyHasOffer = (restored.negotiations || []).some((deal) => deal.listingId === item.id && deal.sellerId === restored.currentUser.id);
      if (!alreadyHasOffer) migratedDeals.push(createDemoBuyerDeal(item, restored.currentUser, (restored.negotiations || []).length + index));
    });
    if (migratedDeals.length) {
      restored.negotiations = [...migratedDeals, ...(restored.negotiations || [])];
      restored.notifications = [
        { id: `n${Date.now()}`, title: 'Simulated campus buyer interest', text: `${migratedDeals.length} demo offer(s) were added to your existing listing(s).`, time: 'Just now', unread: true },
        ...(restored.notifications || [])
      ];
    }
    return restored;
  } catch {
    return starterState;
  }
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const ITEM_CATEGORIES = {
  Electronics: ['Phones & tablets', 'Laptops', 'Audio devices', 'Computer accessories', 'Cables & adapters', 'Other electronics'],
  Books: ['Engineering textbooks', 'Computer science', 'Mathematics', 'Competitive exam guides', 'General reading', 'Other books'],
  Calculators: ['Scientific calculators', 'Basic calculators', 'Graphing calculators', 'Other calculators'],
  Stationery: ['Drawing & geometry', 'Writing supplies', 'Art supplies', 'Organisers', 'Other stationery'],
  'Hostel Essentials': ['Small appliances', 'Storage & organisers', 'Bedding', 'Kitchen items', 'Study furniture', 'Other hostel items'],
  'Lab Equipment': ['Electronics lab', 'Mechanical tools', 'Measuring instruments', 'Project components', 'Safety equipment', 'Other lab equipment'],
  'Sports & Fitness': ['Sports gear', 'Fitness equipment', 'Outdoor accessories', 'Other sports items'],
  Miscellaneous: ['Personal accessories', 'Clothing', 'Daily essentials', 'Other']
};
const categories = ['All items', ...Object.keys(ITEM_CATEGORIES)];
const SELLER_PERSONALITIES = {
  friendly: { label: 'Friendly & fair', description: 'Warm, patient, and open to a reasonable middle ground.', style: 'friendly' },
  firm: { label: 'Firm on price', description: 'Polite but strongly anchored to the listed value.', style: 'firm' },
  blunt: { label: 'Blunt & no-nonsense', description: 'Direct, impatient with unrealistic low offers, but never abusive.', style: 'blunt' },
  urgent: { label: 'Quick sale', description: 'Wants to sell soon and is more flexible for a fast handover.', style: 'urgent' },
  collector: { label: 'Sentimental / particular', description: 'Cares about who receives the item and how it will be used.', style: 'collector' },
  practical: { label: 'Practical negotiator', description: 'Uses condition, age, and comparable value to justify a counteroffer.', style: 'practical' }
};
const categoryIcon = (category) => ({ Books: '▤', Calculators: '⌗', Electronics: '◉', Stationery: '▱', 'Hostel Essentials': '▰', 'Lab Equipment': '⚙', 'Sports & Fitness': '◉' }[category] || '▣');

function extractPrice(text) {
  const matches = String(text).match(/(?:₹|rs\.?\s*)?\s*(\d[\d,]*(?:\.\d{1,2})?)/i);
  if (!matches) return null;
  const value = Number(matches[1].replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

function buildSellerReply(deal, buyerInput, isOpening) {
  const persona = SELLER_PERSONALITIES[deal.sellerPersonality] || SELLER_PERSONALITIES.friendly;
  const style = persona.style;
  const asking = Number(deal.askingPrice || 0);
  const floor = Number(deal.sellerFloor || 0);
  const maxBudget = Number(deal.maxBudget || 0);
  const text = String(buyerInput ?? '');
  const amount = typeof buyerInput === 'number' ? buyerInput : extractPrice(text);
  const lowerText = text.toLowerCase();
  const negative = /\b(no|not|never|don't|do not|can't|cannot)\b/.test(lowerText);
  const affirmative = !negative && /\b(yes|yeah|yep|deal|agreed|okay|ok|works for me|i accept|done)\b/.test(lowerText);
  const wantsLower = /\b(lower|less|too high|expensive|reduce|discount|cheaper|not worth|can't afford|come down|bring it down|drop the price|cut the price)\b/.test(lowerText);
  const counterSeed = deal.counterPrice ? Number(deal.counterPrice) : Math.max(floor, asking);
  const round = Number(deal.roundCount || 0);

  const counterFromOffer = (offer) => {
    const gap = Math.max(0, asking - floor);
    const discount = {
      friendly: 0.35, firm: 0.12, blunt: 0.08,
      urgent: 0.62, collector: 0.18, practical: 0.42
    }[style] ?? 0.35;
    const progress = Math.max(0, Math.min(1, (offer - floor) / Math.max(1, gap)));
    const baseDiscount = Math.min(1, discount + progress * 0.35 + Math.min(round, 4) * 0.035);
    const target = Math.round(asking - gap * baseDiscount);
    return Math.max(floor, Math.min(asking, target));
  };

  const voice = (kind, counter) => {
    const veryLow = amount !== null && amount < asking * 0.7;
    if (kind === 'within') {
      const lines = {
        friendly: `That is a fair starting point. I think we may be close. Would you be happy to put ${money(counter)} forward as your final offer?`,
        firm: `That figure is within the range I can consider. Confirm ${money(counter)} as your final offer and I will send it for approval.`,
        blunt: `Alright, that is at least a serious number. ${money(counter)} is the figure on the table. Are you confirming it?`,
        urgent: `That works for me as a proposed figure. I would like to wrap this up soon. Shall I put ${money(counter)} forward?`,
        collector: `That is a thoughtful offer. I would be comfortable proposing ${money(counter)}, provided the item goes to someone who will look after it.`,
        practical: `That is a workable offer based on the item's condition. I can put ${money(counter)} forward for approval.`
      };
      return lines[style];
    }
    if (kind === 'counter') {
      const lines = {
        friendly: `I understand you are trying to stay within budget. I cannot go that low, but I can come down to ${money(counter)}. Could you meet me there?`,
        firm: `I have already priced this fairly. My counter is ${money(counter)}. I am not looking to move much further.`,
        blunt: veryLow ? `That offer is far too low for this item. Please make a realistic offer. I can consider ${money(counter)}, not a throwaway bid.` : `No, that is still below what I can consider. ${money(counter)} is my counter.`,
        urgent: `I would like to sell this without dragging it out. I can make ${money(counter)} work if you can confirm soon.`,
        collector: `I would rather it go to someone who values it than let it go cheaply. I can consider ${money(counter)}. What do you think?`,
        practical: `Considering the condition and what is included, that price is not quite there. I can reduce it to ${money(counter)}.`
      };
      return lines[style];
    }
    if (kind === 'budget') {
      const lines = {
        friendly: `I appreciate you being upfront. Your maximum is below what I can consider for this item. Could you stretch your budget a little?`,
        firm: `Your stated maximum does not reach a figure I can accept. I will not promise a deal outside the price rules.`,
        blunt: `Then we are too far apart. I am not going to pretend that budget works. You would need to come up.`,
        urgent: `I do want to close this quickly, but that budget is still too far away. Is there any room to increase it?`,
        collector: `I understand the budget, but I would not feel comfortable letting this item go at that amount.`,
        practical: `At that budget, the gap is too large for the item's condition and included accessories. Can you revise it?`
      };
      return lines[style];
    }
    if (kind === 'affirm') {
      return `Great. I have recorded ${money(counter)} as the proposed final price. This is still subject to the actual seller's approval. I will prepare the summary now.`;
    }
    if (kind === 'ask') {
      const lines = {
        friendly: `I am happy to talk it through. The listed price reflects the item's condition. What figure would feel fair to you?`,
        firm: `The price is based on its condition and current listing value. Send a concrete counteroffer if you want me to review it.`,
        blunt: `I have explained my position. If you want to negotiate, give me a number that is worth discussing.`,
        urgent: `Let's keep it simple. Give me the best amount you can manage and I will see whether I can make it work.`,
        collector: `It has been looked after, and that matters to me. Tell me how you plan to use it and what price you have in mind.`,
        practical: `The price reflects the condition, accessories, and usefulness. Share a specific offer and I will assess it.`
      };
      return lines[style];
    }
    return `I am listening. Please send a specific counteroffer in rupees, or tell me what matters most to you about the deal.`;
  };

  if (isOpening && amount !== null) {
    if (amount > maxBudget) return { text: `You set a maximum budget of ${money(maxBudget)}, so I will keep the negotiation within that limit. Please revise your opening offer.`, counterPrice: null, status: 'negotiating', summary: "The opening offer exceeds the buyer's stated maximum budget." };
    if (amount >= floor) {
      return { text: voice('within', amount), counterPrice: amount, status: 'negotiating', summary: `The seller's AI considers ${money(amount)} a possible deal. Buyer confirmation and seller approval are still required.` };
    }
    const counter = counterFromOffer(amount);
    if (maxBudget < floor) {
      return { text: voice('budget', counter), counterPrice: counter, status: 'negotiating', summary: "The buyer maximum budget is below the seller's confidential acceptance range. No agreement has been reached." };
    }
    return { text: voice('counter', counter), counterPrice: counter, status: 'negotiating', summary: `The seller's AI countered at ${money(counter)}. Negotiation is still open.` };
  }

  if (affirmative && amount === null && deal.counterPrice && Number(deal.counterPrice) <= maxBudget && Number(deal.counterPrice) >= floor) {
    const final = Number(deal.counterPrice);
    return { text: voice('affirm', final), counterPrice: final, tentativePrice: final, status: 'pending_seller', summary: `Buyer accepted the AI counter of ${money(final)}. This tentative agreement is waiting for seller approval.` };
  }

  if (amount !== null) {
    const revisesBudget = /\b(stretch|increase|raise|revise|update|maximum budget|my max|budget to|go up to)\b/.test(lowerText);
    if (amount > maxBudget && revisesBudget) {
      return { text: `Thanks for clarifying. I have updated your maximum budget to ${money(amount)}. That is only your new limit, not an offer. What price would you actually like to put forward?`, counterPrice: deal.counterPrice, newMaxBudget: amount, status: 'negotiating', summary: `Buyer revised their maximum budget to ${money(amount)}. Negotiation remains open.` };
    }
    if (amount > maxBudget) {
      return { text: `That is above the maximum budget you gave me (${money(maxBudget)}). I cannot negotiate beyond your own limit. To change your limit, say something like: “I can stretch my maximum budget to ₹900.”`, counterPrice: deal.counterPrice, status: 'negotiating', summary: 'The buyer suggested an amount above their own stated maximum budget.' };
    }
    if (amount >= floor) {
      return { text: voice('affirm', amount), counterPrice: amount, tentativePrice: amount, status: 'pending_seller', summary: `Buyer offered ${money(amount)}, which is within the seller's private rules. The tentative agreement is waiting for seller approval.` };
    }
    const concessionStep = { friendly: 0.34, firm: 0.08, blunt: 0.03, urgent: 0.5, collector: 0.12, practical: 0.24 }[style] ?? 0.3;
    const newCounter = Math.max(floor, Math.round(counterSeed - (counterSeed - floor) * concessionStep));
    if (maxBudget < floor) {
      return { text: voice('budget', newCounter), counterPrice: newCounter, status: 'negotiating', summary: "No agreement reached. The buyer needs to revise their maximum budget to continue." };
    }
    return { text: voice('counter', newCounter), counterPrice: newCounter, status: 'negotiating', summary: `The AI countered at ${money(newCounter)}. Waiting for the buyer's response.` };
  }

  if (wantsLower) {
    const concessionStep = { friendly: 0.22, firm: 0.05, blunt: 0.02, urgent: 0.4, collector: 0.07, practical: 0.16 }[style] ?? 0.2;
    const adjusted = Math.max(floor, Math.round(counterSeed - (counterSeed - floor) * concessionStep));
    return { text: voice('counter', adjusted), counterPrice: adjusted, status: 'negotiating', summary: `Buyer requested a lower price. The AI adjusted its counter to ${money(adjusted)}, subject to the seller's approval.` };
  }
  if (affirmative && (!deal.counterPrice || deal.counterPrice > maxBudget)) {
    return { text: `I still need a clear price to put forward. What amount would you like to offer?`, counterPrice: deal.counterPrice, status: 'negotiating', summary: 'The buyer expressed interest but has not confirmed a price.' };
  }
  return { text: voice('ask', deal.counterPrice || asking), counterPrice: deal.counterPrice, status: 'negotiating', summary: 'The conversation is ongoing. No price has been agreed.' };
}


const DEMO_BUYERS = [
  { name: 'Ananya Rao', id: 'demo-ananya', opening: 0.62, ceiling: 0.94, message: 'I am interested, but I am working with a student budget. Would you consider a lower price?' },
  { name: 'Karthik Menon', id: 'demo-karthik', opening: 0.70, ceiling: 0.97, message: 'The item looks good. I would like to make a fair offer and can collect it on campus.' },
  { name: 'Nisha Verma', id: 'demo-nisha', opening: 0.56, ceiling: 0.90, message: 'I like the listing, although the price is a little above what I planned to spend.' },
  { name: 'Rahul Das', id: 'demo-rahul', opening: 0.76, ceiling: 0.99, message: 'I can pick this up today. Is there room for a small discount?' },
  { name: 'Ishita Menon', id: 'demo-ishita', opening: 0.66, ceiling: 0.95, message: 'Would you be open to negotiating? I can make the exchange convenient.' }
];

function createDemoBuyerDeal(item, seller, existingDealCount = 0) {
  const buyer = DEMO_BUYERS[existingDealCount % DEMO_BUYERS.length];
  const asking = Math.max(1, Number(item.price || 0));
  const floor = Math.max(0, Number(item.minPrice || 0));
  const maxBudget = Math.min(asking, Math.max(floor, Math.round(asking * buyer.ceiling)));
  const openingOffer = Math.max(1, Math.min(maxBudget, Math.round(asking * buyer.opening)));
  const id = `d${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const deal = {
    id,
    listingId: item.id,
    listingTitle: item.title,
    buyer: buyer.name,
    buyerId: `${buyer.id}-${Date.now()}`,
    seller: seller.name,
    sellerId: seller.id,
    askingPrice: asking,
    sellerFloor: floor,
    openingOffer,
    maxBudget,
    sellerPersonality: item.sellerPersonality || 'friendly',
    aiNegotiation: Boolean(item.aiEnabled),
    simulated: true,
    buyerStyle: 'Budget-conscious campus buyer',
    roundCount: 0,
    counterPrice: null,
    tentativePrice: null,
    status: item.aiEnabled ? 'negotiating' : 'seller_review',
    transcript: [{ speaker: 'buyer', text: `${buyer.message} My opening offer is ${money(openingOffer)}, and my maximum budget is ${money(maxBudget)}.` }],
    created: new Date().toISOString(),
    summary: 'A simulated campus buyer has sent an offer. Review the conversation and proposed terms.'
  };

  if (!item.aiEnabled) {
    deal.summary = `${buyer.name} offered ${money(openingOffer)} against your asking price of ${money(asking)}. Review or decline this simulated offer.`;
    return deal;
  }

  const firstReply = buildSellerReply(deal, openingOffer, true);
  deal.transcript.push({ speaker: 'ai', text: firstReply.text });
  deal.counterPrice = firstReply.counterPrice;
  deal.roundCount = 1;
  deal.status = firstReply.status;
  deal.summary = firstReply.summary;

  // Simulate one thoughtful buyer counter so the owner can see the complete AI workflow.
  if (deal.status === 'negotiating' && maxBudget >= floor) {
    const buyerCounter = Math.max(floor, Math.min(maxBudget, Math.round((Math.max(floor, openingOffer) + maxBudget) / 2)));
    deal.transcript.push({ speaker: 'buyer', text: `I have reviewed your counter. I can stretch to ${money(buyerCounter)} if we can complete the handover on campus. Would that work?` });
    const secondReply = buildSellerReply(deal, buyerCounter, false);
    deal.transcript.push({ speaker: 'ai', text: secondReply.text });
    deal.counterPrice = secondReply.counterPrice ?? deal.counterPrice;
    deal.tentativePrice = secondReply.tentativePrice ?? null;
    deal.status = secondReply.status;
    deal.summary = secondReply.status === 'pending_seller'
      ? `${buyer.name} and your AI assistant reached a tentative price of ${money(secondReply.tentativePrice)} after ${deal.roundCount + 1} negotiation rounds. This is within your private minimum of ${money(floor)} and is waiting for your approval.`
      : secondReply.summary;
    deal.roundCount += 1;
  }

  return deal;
}

function App() {
  const [data, setData] = useState(loadState);
  const [page, setPage] = useState('home');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All items');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const notify = (title, text) => {
    setData((prev) => ({ ...prev, notifications: [{ id: `n${Date.now()}`, title, text, time: 'Just now', unread: true }, ...prev.notifications] }));
  };
  const listings = data.listings.filter((item) => item.status === 'active');
  const visibleListings = useMemo(() => listings.filter((item) => {
    const matchesSearch = `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All items' || item.category === category;
    const matchesFilter = filter === 'all' || (filter === 'barter' && item.mode.includes('barter')) || (filter === 'rent' && item.mode === 'rent') || (filter === 'sell' && item.mode !== 'rent');
    return matchesSearch && matchesCategory && matchesFilter;
  }), [listings, search, category, filter]);

  const openListing = (item) => { setSelectedListing(item); setModal('listing'); };
  const go = (target) => { setPage(target); setSearch(''); setCategory('All items'); setFilter('all'); };
  const unread = data.notifications.filter((n) => n.unread).length;
  const myListings = data.listings.filter((item) => item.ownerId === data.currentUser.id);
  const pendingDeals = data.negotiations.filter((deal) => ['negotiating', 'pending_seller', 'seller_review'].includes(deal.status));

  function createListing(form) {
    const item = { ...form, id: `p${Date.now()}`, owner: data.currentUser.name, ownerId: data.currentUser.id, campus: data.currentUser.campus, location: form.location || 'Campus pickup', created: 'Just now', status: 'active', icon: categoryIcon(form.category), color: 'blue' };
    const demoDeal = item.mode === 'rent' ? null : createDemoBuyerDeal(item, data.currentUser, data.negotiations.length);
    const newNotifications = demoDeal ? [{ id: `n${Date.now()}`, title: demoDeal.aiNegotiation ? 'A campus buyer negotiated with your AI' : 'A campus buyer sent an offer', text: `${demoDeal.buyer} · ${item.title} · ${money(demoDeal.tentativePrice || demoDeal.openingOffer)}${demoDeal.tentativePrice ? ' tentative, approval needed' : ' offer received'}`, time: 'Just now', unread: true }, ...data.notifications] : data.notifications;
    update({
      listings: [item, ...data.listings],
      negotiations: demoDeal ? [demoDeal, ...data.negotiations] : data.negotiations,
      notifications: newNotifications
    });
    setModal(null);
    setToast(demoDeal ? `Listing published. ${demoDeal.buyer} sent a simulated offer for you to review.` : 'Your rental listing is live in the demo marketplace.');
    go('my-listings');
  }

  function simulateBuyerInterest(listingId) {
    const item = data.listings.find((entry) => entry.id === listingId && entry.ownerId === data.currentUser.id);
    if (!item || item.mode === 'rent') return;
    const deal = createDemoBuyerDeal(item, data.currentUser, data.negotiations.length);
    update({
      negotiations: [deal, ...data.negotiations],
      notifications: [{ id: `n${Date.now()}`, title: deal.aiNegotiation ? 'AI negotiation completed a first pass' : 'New simulated buyer offer', text: `${deal.buyer} · ${item.title} · ${money(deal.tentativePrice || deal.openingOffer)}`, time: 'Just now', unread: true }, ...data.notifications]
    });
    setToast(`Simulated buyer ${deal.buyer} has contacted you.`);
    setPage('messages');
    setActiveChat(`deal-${deal.id}`);
  }

  function openDeal(dealId) {
    setPage('messages');
    setActiveChat(`deal-${dealId}`);
  }

  function toggleSaved(id) {
    update({ saved: data.saved.includes(id) ? data.saved.filter((x) => x !== id) : [...data.saved, id] });
  }

  function startNegotiation(item, openingOffer, maxBudget) {
    const sellerFloor = Number(item.minPrice || 0);
    const asking = Number(item.price || 0);
    const firstOffer = Number(openingOffer);
    const ceiling = Number(maxBudget);
    const persona = item.sellerPersonality || 'friendly';
    const deal = {
      id: `d${Date.now()}`, listingId: item.id, listingTitle: item.title,
      buyer: data.currentUser.name, buyerId: data.currentUser.id,
      seller: item.owner, sellerId: item.ownerId, askingPrice: asking,
      sellerFloor, openingOffer: firstOffer, maxBudget: ceiling,
      sellerPersonality: persona, aiNegotiation: true, roundCount: 0,
      counterPrice: null, tentativePrice: null, status: 'negotiating',
      transcript: [{ speaker: 'buyer', text: `Hi! I am interested in ${item.title}. My opening offer is ${money(firstOffer)} and my maximum budget is ${money(ceiling)}.` }],
      created: new Date().toISOString(), summary: 'The AI is negotiating with the buyer. No deal has been agreed yet.'
    };
    const firstReply = buildSellerReply(deal, firstOffer, true);
    deal.transcript.push({ speaker: 'ai', text: firstReply.text });
    deal.counterPrice = firstReply.counterPrice;
    deal.roundCount = 1;
    deal.status = firstReply.status;
    deal.summary = firstReply.summary;
    update({ negotiations: [deal, ...data.negotiations] });
    setModal(null);
    setToast('AI negotiation started. Continue the conversation in Messages.');
    go('messages');
    setActiveChat(`deal-${deal.id}`);
  }

  function sendMessage() {
    if (!messageText.trim() || !activeChat) return;
    const text = messageText.trim();
    if (activeChat.startsWith('deal-')) {
      const dealId = activeChat.slice(5);
      const deal = data.negotiations.find((entry) => entry.id === dealId);
      if (deal?.aiNegotiation && deal.status === 'negotiating') {
        const buyerLine = { speaker: 'buyer', text };
        const reply = buildSellerReply(deal, text, false);
        const updatedDeal = {
          ...deal,
          transcript: [...deal.transcript, buyerLine, { speaker: 'ai', text: reply.text }],
          counterPrice: reply.counterPrice ?? deal.counterPrice,
          tentativePrice: reply.tentativePrice ?? null,
          maxBudget: reply.newMaxBudget ?? deal.maxBudget,
          roundCount: (deal.roundCount || 0) + 1,
          status: reply.status,
          summary: reply.summary,
          lastBuyerMessage: text,
          lastUpdated: new Date().toISOString()
        };
        update({ negotiations: data.negotiations.map((entry) => entry.id === dealId ? updatedDeal : entry) });
        setMessageText('');
        if (reply.status === 'pending_seller') {
          notify('AI negotiation ready for seller review', `${deal.listingTitle}: tentative price ${money(reply.tentativePrice)}. Seller approval is required.`);
        }
        return;
      }
    }
    const msg = { id: `m${Date.now()}`, chatId: activeChat, from: data.currentUser.id, text, time: new Date().toISOString() };
    update({ messages: [...data.messages, msg] });
    setMessageText('');
  }

  function sellerDecision(dealId, decision) {
    const deal = data.negotiations.find((x) => x.id === dealId);
    if (decision === 'approve' && deal?.aiNegotiation && (Number(deal.tentativePrice) < Number(deal.sellerFloor) || Number(deal.tentativePrice) > Number(deal.maxBudget))) {
      setToast('This proposed price is outside the buyer or seller price limits. The deal cannot be approved.');
      return;
    }
    const updated = data.negotiations.map((deal) => deal.id === dealId ? { ...deal, status: decision === 'approve' ? 'approved' : 'rejected', sellerDecisionAt: new Date().toISOString() } : deal);
    update({ negotiations: updated });
    if (decision === 'approve' && deal) {
      const finalPrice = deal.tentativePrice ?? deal.openingOffer;
      update({ orders: [{ id: `o${Date.now()}`, listingId: deal.listingId, title: deal.listingTitle, buyer: deal.buyer, seller: deal.seller, price: deal.tentativePrice ?? deal.openingOffer, offeredItem: deal.offeredItem || '', cashDifference: deal.cashDifference || 0, status: 'approved_pending_handover', created: new Date().toISOString() }, ...data.orders], listings: data.listings.map((x) => x.id === deal.listingId ? { ...x, status: 'reserved' } : x) });
      notify('Seller approved the deal', `${deal.listingTitle} is reserved at ${money(finalPrice)}. Arrange the campus handover.`);
      setToast('Deal approved. The listing is now reserved.');
    } else {
      notify('Seller declined the deal', `${deal?.listingTitle || 'Your item'} was not approved.`);
      setToast('Deal declined. The buyer can make another offer.');
    }
  }

  function makeRegularOffer(item, form) {
    const offer = { id: `d${Date.now()}`, listingId: item.id, listingTitle: item.title, buyer: data.currentUser.name, buyerId: data.currentUser.id, seller: item.owner, sellerId: item.ownerId, askingPrice: item.price, openingOffer: Number(form.amount), tentativePrice: null, status: 'seller_review', transcript: [{ speaker: 'buyer', text: form.note || `I would like to offer ${money(form.amount)} for this item.` }], summary: `Buyer offered ${money(form.amount)} against an asking price of ${money(item.price)}. Seller response required.`, created: new Date().toISOString() };
    update({ negotiations: [offer, ...data.negotiations] });
    notify('New offer received', `${item.title}: ${money(form.amount)} offer waiting for review.`);
    setModal(null); setToast('Offer sent to the seller.');
  }

  function requestRental(item, form) {
    const rental = { id: `r${Date.now()}`, listingId: item.id, title: item.title, renter: data.currentUser.name, renterId: data.currentUser.id, owner: item.owner, ownerId: item.ownerId, start: form.start, days: Number(form.days), price: item.rentPrice, deposit: item.deposit || 0, status: 'pending', total: Number(item.rentPrice) * Number(form.days), created: new Date().toISOString() };
    update({ rentals: [rental, ...data.rentals] });
    notify('Rental request sent', `${item.title} for ${form.days} day(s). Owner confirmation required.`);
    setModal(null); setToast('Rental request sent.'); go('rentals');
  }

  function createBarter(item, form) {
    const cash = Number(form.cash || 0);
    const offeredValue = Number(form.estimatedValue || 0);
    const offeredDescription = form.description?.trim() || 'No additional description provided.';
    const offeredSummary = `${form.itemName} (${form.category} / ${form.subcategory})`;
    const offer = {
      id: `d${Date.now()}`, listingId: item.id, listingTitle: item.title,
      buyer: data.currentUser.name, buyerId: data.currentUser.id,
      seller: item.owner, sellerId: item.ownerId, askingPrice: item.price,
      openingOffer: offeredValue + cash, offeredItem: form.itemName,
      offeredCategory: form.category, offeredSubcategory: form.subcategory,
      offeredCondition: form.condition, offeredDescription, offeredValue,
      cashDifference: cash, tentativePrice: null, status: 'seller_review',
      sellerPersonality: item.sellerPersonality || 'friendly', aiNegotiation: false,
      transcript: [{ speaker: 'buyer', text: `I would like to exchange my ${offeredSummary}. Condition: ${form.condition}. Estimated value: ${money(offeredValue)}. Description: ${offeredDescription}${cash ? ` I can add ${money(cash)} cash.` : ''}` }],
      summary: `Barter proposal: ${offeredSummary}, estimated at ${money(offeredValue)}${cash ? ` plus ${money(cash)} cash` : ''}. Seller approval required.`,
      created: new Date().toISOString()
    };
    update({ negotiations: [offer, ...data.negotiations] });
    notify('New barter offer', `${item.title}: exchange offer waiting for review.`);
    setModal(null); setToast('Barter offer sent to the seller.');
  }

  const navItems = [
    { id: 'home', label: 'Overview', icon: '⌂' },
    { id: 'marketplace', label: 'Marketplace', icon: '▦' },
    { id: 'barter', label: 'Barter exchange', icon: '⇄' },
    { id: 'rent', label: 'Rent items', icon: '◷' },
    { id: 'messages', label: 'Messages & deals', icon: '▤', count: pendingDeals.length },
    { id: 'rentals', label: 'Rental requests', icon: '▣' },
    { id: 'my-listings', label: 'My listings', icon: '□' }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">cl</div><div><div className="brand-name">campusloop<span>.</span></div><div className="brand-caption">THE CAMPUS EXCHANGE</div></div></div>
        <div className="campus-switch"><div className="campus-dot">C</div><div className="campus-copy"><strong>CMR University</strong><span>Lakeside Campus</span></div><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map((item) => <button key={item.id} className={`nav-link ${page === item.id ? 'active' : ''}`} onClick={() => go(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.count > 0 && <span className="nav-count">{item.count}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="campus-note"><div className="note-icon">✦</div><strong>Made for campus life</strong><p>Give useful things a second life. Keep the exchange local.</p></div><button className="profile-mini" onClick={() => setModal('profile')}><div className="avatar you">YO</div><div><strong>{data.currentUser.name}</strong><span>{data.currentUser.course}</span></div><span className="more">•••</span></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{navItems.find((n) => n.id === page)?.label || 'Overview'}</strong></div><div className="top-actions"><div className="demo-pill"><span className="pulse-dot"></span> DEMO MODE</div><button className="icon-button notification-button" onClick={() => setNotificationOpen(!notificationOpen)} aria-label="Notifications">♧{unread > 0 && <i>{unread}</i>}</button><button className="avatar small you" onClick={() => setModal('profile')}>YO</button></div>
          {notificationOpen && <div className="notification-popover"><div className="popover-head"><strong>Notifications</strong><button onClick={() => update({ notifications: data.notifications.map((n) => ({ ...n, unread: false })) })}>Mark all read</button></div>{data.notifications.slice(0, 5).map((n) => <div className="notification-row" key={n.id}><span className={`notification-dot ${n.unread ? 'unread' : ''}`}></span><div><strong>{n.title}</strong><p>{n.text}</p><small>{n.time}</small></div></div>)}</div>}
        </header>

        <div className="content-wrap">
          {page === 'home' && <HomePage data={data} listings={listings} pendingDeals={pendingDeals} onNavigate={go} onOpen={openListing} onCreate={() => setModal('new-listing')} />}
          {(page === 'marketplace' || page === 'barter' || page === 'rent') && <MarketplacePage page={page} listings={visibleListings.filter((item) => page === 'barter' ? item.mode.includes('barter') : page === 'rent' ? item.mode === 'rent' : true)} search={search} setSearch={setSearch} category={category} setCategory={setCategory} filter={filter} setFilter={setFilter} onOpen={openListing} onCreate={() => setModal('new-listing')} saved={data.saved} onSave={toggleSaved} />}
          {page === 'my-listings' && <MyListingsPage listings={myListings} deals={data.negotiations.filter((d) => d.sellerId === data.currentUser.id)} onCreate={() => setModal('new-listing')} onOpen={openListing} onOpenDeal={openDeal} onSimulateInterest={simulateBuyerInterest} onToggleAI={(id) => update({ listings: data.listings.map((x) => x.id === id ? { ...x, aiEnabled: !x.aiEnabled } : x) })} />}
          {page === 'messages' && <MessagesPage data={data} activeChat={activeChat} setActiveChat={setActiveChat} messageText={messageText} setMessageText={setMessageText} onSend={sendMessage} onSellerDecision={sellerDecision} onAIReview={(id) => setModal({ type: 'deal-detail', id })} />}
          {page === 'rentals' && <RentalsPage rentals={data.rentals} onUpdate={(id, status) => update({ rentals: data.rentals.map((r) => r.id === id ? { ...r, status } : r) })} />}
        </div>
      </main>

      {modal === 'new-listing' && <NewListingModal onClose={() => setModal(null)} onSubmit={createListing} />}
      {modal === 'listing' && selectedListing && <ListingModal item={selectedListing} data={data} onClose={() => setModal(null)} onAI={(opening, max) => startNegotiation(selectedListing, opening, max)} onOffer={(form) => makeRegularOffer(selectedListing, form)} onBarter={(form) => createBarter(selectedListing, form)} onRent={(form) => requestRental(selectedListing, form)} onSave={() => toggleSaved(selectedListing.id)} isSaved={data.saved.includes(selectedListing.id)} onToast={setToast} />}
      {modal?.type === 'deal-detail' && <DealDetailModal deal={data.negotiations.find((d) => d.id === modal.id)} onClose={() => setModal(null)} onDecision={sellerDecision} />}
      {modal === 'profile' && <ProfileModal user={data.currentUser} onClose={() => setModal(null)} onSave={(name, course) => { update({ currentUser: { ...data.currentUser, name, initials: initials(name), course } }); setModal(null); setToast('Demo profile updated.'); }} onReset={() => { localStorage.removeItem(STORAGE_KEY); setData(starterState); setModal(null); setPage('home'); setToast('Demo data has been reset.'); }} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, subtitle, action, actionLabel = '＋ Create listing' }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="button primary" onClick={action}>{actionLabel}</button>}</div>;
}

function HomePage({ data, listings, pendingDeals, onNavigate, onOpen, onCreate }) {
  const recent = listings.slice(0, 4);
  const active = data.listings.filter((x) => x.ownerId === data.currentUser.id && x.status === 'active').length;
  return <>
    <section className="hero-panel"><div className="hero-text"><div className="hero-kicker"><span className="sparkle">✳</span> YOUR CAMPUS, YOUR MARKETPLACE</div><h1>Good things deserve<br /><em>another round.</em></h1><p>Trade what you have. Find what you need. Keep it all within campus.</p><div className="hero-actions"><button className="button light" onClick={() => onNavigate('marketplace')}>Explore marketplace <span>↗</span></button><button className="button hero-ghost" onClick={onCreate}>＋ List an item</button></div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-card hero-card-back"><span>RECIRCULATE</span><b>↗</b></div><div className="hero-card hero-card-front"><div className="hero-card-top"><span>THE EXCHANGE</span><span className="tiny-star">✦</span></div><div className="exchange-symbol">⇄</div><div className="hero-card-bottom"><strong>One campus.<br />Many possibilities.</strong><span>CMR / 2026</span></div></div><div className="floating-chip chip-one">⌗ <span>Calculators</span></div><div className="floating-chip chip-two">▤ <span>Textbooks</span></div></div></section>
    <div className="stat-grid"><StatCard label="Available on campus" value={listings.length} note="Live listings" icon="▦" tone="blue" /><StatCard label="Your active listings" value={active} note="Items you have posted" icon="□" tone="green" /><StatCard label="Deals to review" value={pendingDeals.length} note="AI or buyer offers" icon="✦" tone="amber" /><StatCard label="Campus community" value="1" suffix=" campus" note="CMR Lakeside" icon="⌖" tone="violet" /></div>
    <div className="section-heading"><div><div className="eyebrow">THE LATEST FINDS</div><h2>Recently listed</h2></div><button className="text-button" onClick={() => onNavigate('marketplace')}>View all items <span>↗</span></button></div>
    <div className="listing-grid">{recent.map((item) => <ListingCard key={item.id} item={item} onOpen={onOpen} />)}</div>
    <section className="bottom-feature"><div className="feature-icon">✦</div><div><strong>Let the AI handle the back-and-forth.</strong><p>Set your minimum price once. CampusLoop AI can negotiate within your rules, then send you a deal summary to approve.</p></div><button className="button dark-outline" onClick={() => onNavigate('my-listings')}>Set up AI bargaining <span>↗</span></button></section>
  </>;
}

function StatCard({ label, value, suffix = '', note, icon, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-note">{note}</div></div>; }

function MarketplacePage({ page, listings, search, setSearch, category, setCategory, filter, setFilter, onOpen, onCreate, saved, onSave }) {
  const heading = page === 'barter' ? ['EXCHANGE ECONOMY', 'Barter, not just buy.', 'Find someone who has what you need and wants what you have.'] : page === 'rent' ? ['BORROW FOR A WHILE', 'Access over ownership.', 'Find useful things for a day, a week, or a semester.'] : ['THE CAMPUS MARKET', 'Find your next useful thing.', 'Browse pre-loved essentials listed by people on your campus.'];
  return <>
    <PageHeading eyebrow={heading[0]} title={heading[1]} subtitle={heading[2]} action={onCreate} />
    <div className="market-toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search calculators, books, electronics..." /></div><div className="toolbar-right"><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>{page === 'marketplace' && <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All types</option><option value="sell">Buy / Sell</option><option value="barter">Barter available</option><option value="rent">Rent</option></select>}</div></div>
    <div className="filter-chips">{['All items', 'Calculators', 'Books', 'Electronics', 'Stationery', 'Hostel Essentials'].map((c) => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'selected' : ''}>{c}</button>)}</div>
    <div className="results-row"><span><strong>{listings.length}</strong> items available</span><span className="campus-only"><span className="pulse-dot"></span> CMR University only</span></div>
    {listings.length ? <div className="listing-grid">{listings.map((item) => <ListingCard key={item.id} item={item} onOpen={onOpen} saved={saved.includes(item.id)} onSave={onSave} />)}</div> : <EmptyState title="Nothing found just yet" body="Try a different search or category. New listings are added by students on campus." action="Clear filters" onAction={() => { setSearch(''); setCategory('All items'); setFilter('all'); }} />}
  </>;
}

function ListingCard({ item, onOpen, saved = false, onSave }) {
  return <article className="listing-card"><button className={`save-button ${saved ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); onSave?.(item.id); }} aria-label="Save listing">{saved ? '♥' : '♡'}</button><button className="listing-main" onClick={() => onOpen(item)}><div className={`product-art ${item.color || 'blue'}`}><span className="product-symbol">{item.icon || '▰'}</span><span className="art-label">{item.category}</span>{item.aiEnabled && <span className="ai-art-tag">✦ AI BARGAIN</span>}</div><div className="listing-info"><div className="listing-meta"><span>{item.condition}</span><span>·</span><span>{item.created}</span></div><h3>{item.title}</h3><div className="listing-price-row">{item.mode === 'rent' ? <strong>{money(item.rentPrice)}<small> / {item.rentUnit || 'day'}</small></strong> : <strong>{money(item.price)}</strong>}<span className="listing-type">{item.mode === 'rent' ? 'FOR RENT' : item.mode.includes('barter') ? 'SELL / BARTER' : 'FOR SALE'}</span></div><div className="seller-line"><span className="avatar tiny">{initials(item.owner)}</span><span>{item.owner}</span><span className="seller-location">· {item.location}</span></div></div></button></article>;
}

function MyListingsPage({ listings, deals, onCreate, onOpen, onToggleAI, onSimulateInterest, onOpenDeal }) {
  const waiting = deals.filter((d) => ['negotiating', 'pending_seller', 'seller_review'].includes(d.status));
  return <>
    <PageHeading eyebrow="YOUR CORNER OF CAMPUS" title="Your listings" subtitle="Manage what you have posted and decide how much the AI can negotiate on your behalf." action={onCreate} />
    <div className="seller-banner"><div className="seller-banner-icon">✦</div><div><strong>Your AI negotiation desk</strong><p>AI can respond while you are busy, but it can never go below the minimum price you set. Every tentative deal waits for your approval. Demo buyers are simulated so you can test the full flow before real students join.</p></div><div className="seller-banner-count"><b>{waiting.length}</b><span>active / review</span></div></div>
    <div className="section-heading compact"><div><h2>Active listings <span className="muted-count">{listings.filter((x) => x.status === 'active').length}</span></h2></div></div>
    {listings.length ? <div className="my-listing-list">{listings.map((item) => <div className="my-listing-row" key={item.id}><div className={`mini-product ${item.color || 'blue'}`}>{item.icon}</div><div className="my-listing-name"><strong>{item.title}</strong><span>{item.category} · {item.condition}</span></div><div className="my-listing-price"><strong>{item.mode === 'rent' ? `${money(item.rentPrice)}/day` : money(item.price)}</strong><span>Floor: {item.mode === 'rent' ? 'Not applicable' : money(item.minPrice)}</span></div><div className="ai-toggle-cell"><span className={`status-label ${item.aiEnabled ? 'enabled' : ''}`}>{item.aiEnabled ? 'AI enabled' : 'AI off'}</span><button className={`switch ${item.aiEnabled ? 'on' : ''}`} onClick={() => onToggleAI(item.id)} aria-label="Toggle AI bargaining"><i></i></button></div><div className="listing-row-actions"><button className="button secondary small-button" onClick={() => onSimulateInterest(item.id)} disabled={item.mode === 'rent'}>Simulate buyer</button><button className="row-more" onClick={() => onOpen(item)}>View ↗</button></div></div>)}</div> : <EmptyState title="Your marketplace starts here" body="List an item you no longer need and let another student give it a second life." action="Create your first listing" onAction={onCreate} />}
    <div className="section-heading compact review-heading"><div><h2>Incoming offers <span className="muted-count">{deals.length}</span></h2><p>Simulated campus buyers and AI-negotiated summaries waiting for your decision.</p></div></div>
    {deals.length ? <div className="offer-table">{deals.map((deal) => <div className="offer-table-row" key={deal.id}><div><strong>{deal.listingTitle}</strong><span>{deal.buyer}{deal.simulated ? ' · Demo buyer' : ''} · {new Date(deal.created).toLocaleDateString('en-IN')}</span></div><div><strong>{money(deal.tentativePrice || deal.openingOffer)}</strong><span>{deal.tentativePrice ? 'AI tentative price' : 'Buyer offer'}</span></div><span className={`pill ${['negotiating', 'pending_seller', 'seller_review'].includes(deal.status) ? 'pending' : 'done'}`}>{deal.status.replaceAll('_', ' ')}</span><div className="table-actions"><button onClick={() => onOpenDeal(deal.id)}>Open conversation ↗</button></div></div>)}</div> : <div className="subtle-empty">No incoming offers yet. Publish a listing to receive a simulated campus buyer offer, or use “Simulate buyer” to create another test offer.</div>}
  </>;
}

function MessagesPage({ data, activeChat, setActiveChat, messageText, setMessageText, onSend, onSellerDecision, onAIReview }) {
  const allDeals = data.negotiations;
  const chatIds = [...allDeals.map((d) => `deal-${d.id}`), ...data.messages.map((m) => m.chatId).filter((id, i, arr) => arr.indexOf(id) === i && !allDeals.some((d) => `deal-${d.id}` === id))];
  const selectedDeal = activeChat?.startsWith('deal-') ? allDeals.find((d) => `deal-${d.id}` === activeChat) : null;
  const selectedMessages = data.messages.filter((m) => m.chatId === activeChat);
  const persona = selectedDeal ? (SELLER_PERSONALITIES[selectedDeal.sellerPersonality] || SELLER_PERSONALITIES.friendly) : null;
  const awaitingSeller = selectedDeal?.status === 'pending_seller';
  return <>
    <PageHeading eyebrow="KEEP THE CONVERSATION GOING" title="Messages & deals" subtitle="Negotiate, review AI summaries, and keep the exchange organised." />
    <div className="messages-layout">
      <aside className="conversation-list"><div className="conversation-list-head"><strong>Conversations</strong><span>{chatIds.length}</span></div>{chatIds.length === 0 && <div className="conversation-empty">Your conversations will appear here when you make an offer or start a negotiation.</div>}
        {allDeals.map((deal) => <button key={deal.id} className={`conversation-item ${activeChat === `deal-${deal.id}` ? 'active' : ''}`} onClick={() => setActiveChat(`deal-${deal.id}`)}><div className="avatar">{initials(deal.sellerId === data.currentUser.id ? deal.buyer : deal.seller)}</div><div className="conversation-copy"><strong>{deal.aiNegotiation ? (deal.buyerId === data.currentUser.id ? `${deal.seller}'s AI` : 'Your AI assistant') : (deal.sellerId === data.currentUser.id ? deal.buyer : deal.seller)}</strong><span>{deal.listingTitle}</span><small>{deal.tentativePrice ? `Tentative · ${money(deal.tentativePrice)}` : deal.summary}</small></div><span className={`conversation-status ${['pending_seller', 'seller_review', 'negotiating'].includes(deal.status) ? 'yellow' : 'green'}`}></span></button>)}
      </aside>
      <section className="chat-panel">
        {selectedDeal ? <>
          <div className="chat-header"><div className="avatar">{initials(selectedDeal.aiNegotiation ? (selectedDeal.buyerId === data.currentUser.id ? selectedDeal.seller : selectedDeal.buyer) : (selectedDeal.sellerId === data.currentUser.id ? selectedDeal.buyer : selectedDeal.seller))}</div><div><strong>{selectedDeal.aiNegotiation ? (selectedDeal.buyerId === data.currentUser.id ? `${selectedDeal.seller}'s AI assistant` : 'Your AI assistant') : (selectedDeal.sellerId === data.currentUser.id ? selectedDeal.buyer : selectedDeal.seller)}</strong><span>{selectedDeal.listingTitle} · {selectedDeal.status.replaceAll('_', ' ')}</span></div><span className="chat-header-spacer"></span><span className="secure-label">⌖ Campus exchange</span></div>
          {selectedDeal.aiNegotiation && <div className="chat-persona-strip"><span className="persona-avatar">✦</span><div><strong>{persona.label} seller personality</strong><span>{persona.description}</span></div><span className="ai-live-pill">AI ASSISTANT</span></div>}
          <div className="chat-body"><div className="date-divider">TODAY</div>
            {selectedDeal.transcript.map((line, i) => <div key={i} className={`chat-message ${line.speaker === 'buyer' ? (selectedDeal.buyerId === data.currentUser.id ? 'mine' : 'theirs') : (selectedDeal.sellerId === data.currentUser.id ? 'mine' : 'theirs')}`}><div className="message-author">{line.speaker === 'ai' ? <><span className="ai-mini">✦</span> {selectedDeal.aiNegotiation ? (selectedDeal.buyerId === data.currentUser.id ? `${selectedDeal.seller}'s AI` : 'Your AI assistant') : 'CampusLoop AI'}</> : line.speaker === 'buyer' ? (selectedDeal.buyerId === data.currentUser.id ? 'You' : selectedDeal.buyer) : (selectedDeal.sellerId === data.currentUser.id ? 'You' : selectedDeal.seller)}</div><div className="message-bubble">{line.text}</div></div>)}
            {selectedMessages.map((msg) => <div key={msg.id} className={`chat-message ${msg.from === data.currentUser.id ? 'mine' : 'theirs'}`}><div className="message-author">{msg.from === data.currentUser.id ? 'You' : selectedDeal.seller}</div><div className="message-bubble">{msg.text}</div></div>)}
            <div className="deal-summary-card"><div className="summary-heading"><span>✦</span><strong>{selectedDeal.aiNegotiation ? 'Live negotiation summary' : 'Negotiation summary'}</strong><span className="summary-ready">STRUCTURED</span></div>
              <div className="summary-grid"><div><small>Listed price</small><strong>{money(selectedDeal.askingPrice)}</strong></div><div><small>Opening offer</small><strong>{money(selectedDeal.openingOffer)}</strong></div><div><small>Maximum budget</small><strong>{selectedDeal.maxBudget ? money(selectedDeal.maxBudget) : 'Not set'}</strong></div><div><small>Tentative price</small><strong>{selectedDeal.tentativePrice ? money(selectedDeal.tentativePrice) : 'Not agreed'}</strong></div></div>
              {selectedDeal.offeredItem && <div className="barter-summary-details"><strong>Item offered in exchange</strong><p>{selectedDeal.offeredItem} · {selectedDeal.offeredCategory} / {selectedDeal.offeredSubcategory}</p><p>{selectedDeal.offeredCondition} · Estimated value {money(selectedDeal.offeredValue)}</p><p>{selectedDeal.offeredDescription}</p>{selectedDeal.cashDifference > 0 && <p>Additional cash: {money(selectedDeal.cashDifference)}</p>}</div>}
              <p>{selectedDeal.summary}</p>
              {selectedDeal.tentativePrice && selectedDeal.status === 'pending_seller' && <div className="seller-approval-actions"><button className="button primary small-button" onClick={() => onSellerDecision(selectedDeal.id, 'approve')}>Simulate seller approval</button><button className="button secondary small-button" onClick={() => onSellerDecision(selectedDeal.id, 'reject')}>Simulate decline</button></div>}
              {!selectedDeal.tentativePrice && selectedDeal.status === 'seller_review' && <div className="seller-approval-actions"><button className="button primary small-button" onClick={() => onSellerDecision(selectedDeal.id, 'approve')}>Simulate owner approval</button><button className="button secondary small-button" onClick={() => onSellerDecision(selectedDeal.id, 'reject')}>Decline offer</button><span className="helper-inline">Demo mode lets you act as either student.</span></div>}
              {awaitingSeller && <div className="summary-footnote">The AI has prepared a tentative price. The actual seller must approve it before the listing is reserved.</div>}
              {selectedDeal.status === 'negotiating' && <div className="summary-footnote">Negotiation is still active. Send a counteroffer or reply in the chat above. The AI will not finalise a deal on its own.</div>}
              <button className="text-button report-link" onClick={() => onAIReview(selectedDeal.id)}>Open full seller review report ↗</button>
            </div>
          </div>
          {selectedDeal.aiNegotiation && selectedDeal.status === 'negotiating' && <div className="chat-tips"><span>TRY:</span><button type="button" onClick={() => setMessageText('Could you come down a little?')}>Ask for a lower price</button><button type="button" onClick={() => setMessageText(`I can offer ₹${Math.min(selectedDeal.maxBudget, Math.round(selectedDeal.openingOffer * 1.12))}.`)}>Make a counteroffer</button><button type="button" onClick={() => setMessageText('Why is this your best price?')}>Ask for reasoning</button><button type="button" onClick={() => setMessageText(`I can stretch my maximum budget to ₹${selectedDeal.maxBudget + 100}.`)}>Update budget</button></div>}
          <form className={`chat-compose ${awaitingSeller ? 'disabled-compose' : ''}`} onSubmit={(e) => { e.preventDefault(); onSend(); }}><input value={messageText} onChange={(e) => setMessageText(e.target.value)} disabled={awaitingSeller || selectedDeal.status !== 'negotiating' && selectedDeal.aiNegotiation} placeholder={awaitingSeller ? 'Waiting for the seller to review the proposed deal...' : selectedDeal.aiNegotiation ? 'Chat with the seller’s AI, include an amount to counter...' : 'Write a message...'} /><button className="send-button" type="submit" disabled={!messageText.trim() || awaitingSeller}>↑</button></form>
        </> : <div className="chat-placeholder"><div className="placeholder-icon">✉</div><h3>Your campus conversations</h3><p>Select a conversation to view the offer, AI negotiation transcript, and deal summary.</p></div>}
      </section>
    </div>
  </>;
}

function RentalsPage({ rentals, onUpdate }) {
  return <><PageHeading eyebrow="BORROW AND LEND" title="Rental requests" subtitle="Keep short-term borrowing simple, with a clear duration, cost, and return plan." /><div className="rental-notice"><span>◷</span><div><strong>Rental flow is simulated</strong><p>No money is collected. Requests and deposits are only tracked inside this prototype.</p></div></div>{rentals.length ? <div className="offer-table">{rentals.map((r) => <div className="offer-table-row" key={r.id}><div><strong>{r.title}</strong><span>{r.renter} wants it from {r.start} for {r.days} day(s)</span></div><div><strong>{money(r.total)}</strong><span>+ {money(r.deposit)} refundable deposit</span></div><span className={`pill ${r.status === 'pending' ? 'pending' : 'done'}`}>{r.status}</span><div className="table-actions">{r.status === 'pending' && <><button onClick={() => onUpdate(r.id, 'approved')}>Approve</button><button onClick={() => onUpdate(r.id, 'declined')}>Decline</button></>}</div></div>)}</div> : <EmptyState title="No rental requests yet" body="When you request to rent an item, its booking details and approval status will show up here." />}</>;
}

function EmptyState({ title, body, action, onAction }) { return <div className="empty-state"><div className="empty-symbol">⌕</div><h3>{title}</h3><p>{body}</p>{action && <button className="button secondary" onClick={onAction}>{action}</button>}</div>; }

function ModalShell({ title, subtitle, onClose, children, wide = false }) { return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className={`modal-card ${wide ? 'wide' : ''}`}><div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="close-button" onClick={onClose}>×</button></div>{children}</div></div>; }

function NewListingModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', category: 'Electronics', subcategory: ITEM_CATEGORIES.Electronics[3], condition: 'Good', price: '', minPrice: '', description: '', mode: 'sell-barter', aiEnabled: true, sellerPersonality: 'friendly', negotiable: true, wants: '', location: 'Lakeside Campus', rentPrice: '', deposit: '0', rentUnit: 'day' });
  const set = (key, value) => setForm((current) => {
    if (key === 'category') return { ...current, category: value, subcategory: ITEM_CATEGORIES[value][0] };
    return { ...current, [key]: value };
  });
  const submit = (e) => {
    e.preventDefault();
    const price = Number(form.price || 0);
    if (form.mode !== 'rent' && Number(form.minPrice) > price) return;
    onSubmit({ ...form, price, minPrice: form.mode === 'rent' ? 0 : Number(form.minPrice || 0), rentPrice: Number(form.rentPrice || 0), deposit: Number(form.deposit || 0), aiEnabled: form.mode === 'rent' ? false : form.aiEnabled });
  };
  return <ModalShell title="List something useful" subtitle="Add an item to the CMR campus marketplace." onClose={onClose} wide>
    <form className="form-grid" onSubmit={submit}>
      <label className="field full">Item name<input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Casio scientific calculator" /></label>
      <label className="field">Category<select value={form.category} onChange={(e) => set('category', e.target.value)}>{Object.keys(ITEM_CATEGORIES).map((entry) => <option key={entry}>{entry}</option>)}</select></label>
      <label className="field">Subcategory<select value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>{ITEM_CATEGORIES[form.category].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
      <label className="field">Condition<select value={form.condition} onChange={(e) => set('condition', e.target.value)}>{['Like new', 'Very good', 'Good', 'Acceptable', 'For parts'].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
      <label className="field full">Description<textarea required rows="3" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Tell students what is included and mention any wear or defects." /></label>
      <label className="field">Listing type<select value={form.mode} onChange={(e) => set('mode', e.target.value)}><option value="sell-barter">Sell or barter</option><option value="sell">Sell only</option><option value="rent">Rent only</option></select></label>
      {form.mode !== 'rent' ? <>
        <label className="field">Asking price (₹)<input type="number" min="1" required value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="900" /></label>
        <label className="field">Minimum acceptable price (₹)<input type="number" min="0" max={form.price || undefined} required value={form.minPrice} onChange={(e) => set('minPrice', e.target.value)} placeholder="Your private price floor" /><small className="field-help">Only you should see this. AI will never negotiate below it.</small></label>
        <label className="field">Open to exchange for<input value={form.wants} onChange={(e) => set('wants', e.target.value)} placeholder="e.g. Textbooks, headphones, or cash" /></label>
      </> : <>
        <label className="field">Rental price per day (₹)<input type="number" min="1" required value={form.rentPrice} onChange={(e) => set('rentPrice', e.target.value)} placeholder="35" /></label>
        <label className="field">Refundable deposit (₹)<input type="number" min="0" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} /></label>
        <label className="field">Rental unit<select value={form.rentUnit} onChange={(e) => set('rentUnit', e.target.value)}><option value="day">Per day</option></select></label>
      </>}
      {form.mode !== 'rent' && <>
        <label className="field">Seller negotiation personality<select value={form.sellerPersonality} onChange={(e) => set('sellerPersonality', e.target.value)}>{Object.entries(SELLER_PERSONALITIES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select><small className="field-help">This controls how your AI assistant speaks and negotiates with buyers.</small></label>
        <div className="field personality-description"><strong>{SELLER_PERSONALITIES[form.sellerPersonality].label}</strong><p>{SELLER_PERSONALITIES[form.sellerPersonality].description}</p></div>
      </>}
      <label className="field">Pickup location<input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Library entrance" /></label>
      <div className="field full settings-panel"><div><strong>AI bargaining assistant</strong><p>Let CampusLoop AI negotiate while you are busy. You approve every final deal.</p></div><button type="button" className={`switch ${form.aiEnabled && form.mode !== 'rent' ? 'on' : ''}`} onClick={() => set('aiEnabled', !form.aiEnabled)} disabled={form.mode === 'rent'}><i></i></button></div>
      <div className="field full ai-rule-note"><span>✦</span><div><strong>Your price floor stays private.</strong><p>The AI can counter and summarise offers, but it cannot accept a price below your minimum or complete a transaction without your approval.</p></div></div>
      <div className="form-actions full"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary">Publish listing ↗</button></div>
    </form>
  </ModalShell>;
}

function ListingModal({ item, data, onClose, onAI, onOffer, onBarter, onRent, onSave, isSaved, onToast }) {
  const [tab, setTab] = useState(item.mode === 'rent' ? 'rent' : 'buy');
  const [opening, setOpening] = useState(Math.max(1, Math.round((item.price || 0) * 0.62)));
  const [maximum, setMaximum] = useState(item.price || 0);
  const [offer, setOffer] = useState(Math.max(1, Math.round((item.price || 0) * 0.8)));
  const [note, setNote] = useState('');
  const [barter, setBarter] = useState({ category: 'Electronics', subcategory: ITEM_CATEGORIES.Electronics[3], itemName: '', condition: 'Good', description: '', estimatedValue: '', cash: '0' });
  const [start, setStart] = useState('Tomorrow');
  const [days, setDays] = useState(2);
  const mine = item.ownerId === data.currentUser.id;
  const persona = SELLER_PERSONALITIES[item.sellerPersonality] || SELLER_PERSONALITIES.friendly;
  const setBarterField = (key, value) => setBarter((current) => key === 'category' ? { ...current, category: value, subcategory: ITEM_CATEGORIES[value][0] } : { ...current, [key]: value });
  const submitOffer = (e) => { e.preventDefault(); onOffer({ amount: offer, note }); };
  const submitAI = (e) => { e.preventDefault(); if (Number(maximum) < Number(opening)) { onToast('Maximum budget must be at least your opening offer.'); return; } if (Number(maximum) <= 0) { onToast('Enter a valid maximum budget.'); return; } onAI(opening, maximum); };
  return <ModalShell title={item.title} subtitle={`${item.category}${item.subcategory ? ` · ${item.subcategory}` : ''} · Listed by ${item.owner}`} onClose={onClose} wide>
    <div className="detail-layout">
      <div>
        <div className={`detail-art ${item.color || 'blue'}`}><span>{item.icon || '▰'}</span><small>{item.category}{item.subcategory ? ` / ${item.subcategory}` : ''}</small></div>
        <div className="detail-description"><div className="detail-condition"><span>{item.condition}</span><span>·</span><span>{item.location}</span></div><p>{item.description}</p><div className="detail-owner"><div className="avatar">{initials(item.owner)}</div><div><strong>{item.owner}</strong><span>CMR University · Student</span></div><span className="verified">✓ Campus</span></div></div>
      </div>
      <div className="detail-actions">
        <div className="detail-price">{item.mode === 'rent' ? <><strong>{money(item.rentPrice)}</strong><span>per {item.rentUnit || 'day'}</span></> : <><strong>{money(item.price)}</strong><span>asking price</span></>}</div>
        <div className="listing-badges"><span className="pill blue-pill">{item.mode === 'rent' ? 'For rent' : item.mode.includes('barter') ? 'Sell or barter' : 'For sale'}</span>{item.aiEnabled && <span className="pill purple-pill">✦ AI bargaining</span>}</div>
        {mine ? <div className="own-item-note"><strong>This is your listing.</strong><p>Manage its AI bargaining settings from My Listings.</p></div> : <>
          <div className="detail-tabs">{item.mode !== 'rent' && <button className={tab === 'buy' ? 'active' : ''} onClick={() => setTab('buy')}>Make offer</button>}{item.mode.includes('barter') && <button className={tab === 'barter' ? 'active' : ''} onClick={() => setTab('barter')}>Barter</button>}{item.mode === 'rent' && <button className={tab === 'rent' ? 'active' : ''} onClick={() => setTab('rent')}>Rent item</button>}</div>
          {tab === 'buy' && <form className="detail-form" onSubmit={submitOffer}>
            <label className="field">Your offer (₹)<input type="number" min="1" value={offer} onChange={(e) => setOffer(e.target.value)} required /></label>
            <label className="field">Message to seller (optional)<textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hi, is this still available?" /></label>
            <button className="button primary full-button" type="submit">Send offer</button>
            <button className="button secondary full-button" type="button" onClick={() => onOffer({ amount: item.price, note: `I would like to buy this item at the listed price of ${money(item.price)}.` })}>Request to buy at listed price</button>
            {item.aiEnabled && <div className="ai-prompt"><div className="ai-prompt-icon">✦</div><div><strong>Seller is unavailable?</strong><p>Chat with the seller's AI. It will counter, respond to your messages, and prepare a deal summary.</p><button type="button" className="text-button" onClick={() => setTab('ai')}>Start AI bargaining ↗</button></div></div>}
          </form>}
          {tab === 'ai' && <form className="detail-form" onSubmit={submitAI}>
            <div className="ai-explainer"><span>✦</span><div><strong>Chat with {item.owner}'s AI assistant</strong><p>The assistant follows the seller's negotiation style and private minimum price. It will not confirm a deal without seller approval.</p></div></div>
            <div className="seller-persona-preview"><span className="persona-avatar">{persona.label.slice(0,1)}</span><div><strong>{persona.label}</strong><p>{persona.description}</p></div></div>
            <label className="field">Your opening offer (₹)<input type="number" min="1" value={opening} onChange={(e) => setOpening(e.target.value)} required /></label>
            <label className="field">Your maximum budget (₹)<input type="number" min="1" value={maximum} onChange={(e) => setMaximum(e.target.value)} required /></label>
            <small className="field-help">This starts a conversation, not an automatic acceptance. You can negotiate with the AI in the Messages page.</small>
            <button className="button primary full-button" type="submit">Start conversation ✦</button>
            <button className="text-button centered" type="button" onClick={() => setTab('buy')}>Back to normal offer</button>
          </form>}
          {tab === 'barter' && <form className="detail-form" onSubmit={(e) => { e.preventDefault(); if (!barter.itemName.trim()) { onToast('Enter the item you want to offer.'); return; } onBarter(barter); }}>
            <div className="barter-intro"><strong>What would you like to exchange?</strong><p>Describe the item you have. It does not need to be listed separately on CampusLoop.</p></div>
            <label className="field">Category<select value={barter.category} onChange={(e) => setBarterField('category', e.target.value)}>{Object.keys(ITEM_CATEGORIES).map((entry) => <option key={entry}>{entry}</option>)}</select></label>
            <label className="field">Subcategory<select value={barter.subcategory} onChange={(e) => setBarterField('subcategory', e.target.value)}>{ITEM_CATEGORIES[barter.category].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
            <label className="field">Item name<input required value={barter.itemName} onChange={(e) => setBarterField('itemName', e.target.value)} placeholder="e.g. Boat wired earphones" /></label>
            <label className="field">Condition<select value={barter.condition} onChange={(e) => setBarterField('condition', e.target.value)}>{['Like new', 'Very good', 'Good', 'Acceptable', 'For parts'].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
            <label className="field">Description<textarea required rows="3" value={barter.description} onChange={(e) => setBarterField('description', e.target.value)} placeholder="Describe the item, age, accessories, defects, and anything the owner should know." /></label>
            <label className="field">Estimated item value (₹)<input required type="number" min="0" value={barter.estimatedValue} onChange={(e) => setBarterField('estimatedValue', e.target.value)} placeholder="500" /></label>
            <label className="field">Additional cash you can add (₹)<input type="number" min="0" value={barter.cash} onChange={(e) => setBarterField('cash', e.target.value)} /></label>
            <button className="button primary full-button" type="submit">Send barter proposal ⇄</button>
            <small className="field-help">The listed value is only an estimate. The owner can accept, decline, or negotiate the item and cash difference.</small>
          </form>}
          {tab === 'rent' && <form className="detail-form" onSubmit={(e) => { e.preventDefault(); onRent({ start, days }); }}><label className="field">Pickup date<select value={start} onChange={(e) => setStart(e.target.value)}><option>Tomorrow</option><option>Today</option><option>In 2 days</option><option>Next Monday</option></select></label><label className="field">Duration<select value={days} onChange={(e) => setDays(e.target.value)}>{[1, 2, 3, 4, 5, 7, 14].map((d) => <option key={d} value={d}>{d} day(s)</option>)}</select></label><div className="rental-cost"><span>Rental total</span><strong>{money(item.rentPrice * Number(days))}</strong><small>+ {money(item.deposit || 0)} refundable deposit</small></div><button className="button primary full-button" type="submit">Request rental</button></form>}
        </>}
      </div>
    </div>
    <div className="modal-bottom"><button className="text-button" onClick={onSave}>{isSaved ? '♥ Saved to wishlist' : '♡ Save item'}</button><span>⌖ Exchange in person at CMR University</span></div>
  </ModalShell>;
}

function DealDetailModal({ deal, onClose, onDecision }) {
  if (!deal) return null;
  return <ModalShell title="AI negotiation report" subtitle="Seller review required before any transaction is confirmed." onClose={onClose} wide><div className="deal-report"><div className="report-success"><span>✦</span><div><strong>{deal.tentativePrice ? 'Tentative agreement reached' : 'Negotiation needs attention'}</strong><p>{deal.summary}</p></div></div><div className="report-numbers"><div><small>Listing price</small><strong>{money(deal.askingPrice)}</strong></div><div><small>Buyer opening</small><strong>{money(deal.openingOffer)}</strong></div><div><small>Seller style</small><strong>{(SELLER_PERSONALITIES[deal.sellerPersonality] || SELLER_PERSONALITIES.friendly).label}</strong></div><div><small>AI tentative deal</small><strong>{deal.tentativePrice ? money(deal.tentativePrice) : 'None'}</strong></div></div><h3>Negotiation transcript</h3><div className="report-transcript">{deal.transcript.map((line, i) => <div key={i}><strong>{line.speaker === 'ai' ? 'CampusLoop AI' : line.speaker === 'buyer' ? deal.buyer : deal.seller}</strong><p>{line.text}</p></div>)}</div><div className="report-disclaimer">The AI has not collected payment, transferred ownership, or made a binding commitment. Approval here only reserves the listing for the campus handover process.</div>{deal.status === 'pending_seller' && deal.tentativePrice && <div className="form-actions"><button className="button secondary" onClick={() => { onDecision(deal.id, 'reject'); onClose(); }}>Decline</button><button className="button primary" onClick={() => { onDecision(deal.id, 'approve'); onClose(); }}>Approve tentative deal</button></div>}</div></ModalShell>;
}

function ProfileModal({ user, onClose, onSave, onReset }) {
  const [name, setName] = useState(user.name);
  const [course, setCourse] = useState(user.course);
  return <ModalShell title="Demo profile" subtitle="This prototype uses a sample student identity." onClose={onClose}><form className="detail-form" onSubmit={(e) => { e.preventDefault(); onSave(name, course); }}><div className="profile-preview"><div className="avatar large-avatar">{initials(name)}</div><div><strong>{name}</strong><span>CMR University · Lakeside Campus</span></div></div><label className="field">Display name<input value={name} onChange={(e) => setName(e.target.value)} required /></label><label className="field">Course<input value={course} onChange={(e) => setCourse(e.target.value)} /></label><button className="button primary full-button" type="submit">Save profile</button><div className="reset-area"><strong>Reset this prototype</strong><p>Remove saved changes and restore the original sample listings and activity.</p><button type="button" className="text-button danger-text" onClick={onReset}>Reset all demo data</button></div></form></ModalShell>;
}

createRoot(document.getElementById('root')).render(<App />);
