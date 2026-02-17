import { Contact, Message, Sequence, Agent, Enrollment } from './types';

// --- Raw Data ---
// Embedded subset of the provided log file for development
const CSV_DATA = `"Started At",Type,Direction,"Disposition Status","Line Name","Incoming Number","Sequence Name","Contact Number","Contact First Name","Contact Last Name","Contact Owner",Tags,Notes,Body,"Call Disposition",Voicemail,Recording
"2026-02-10 09:37:07",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+15512210660,Gina,,,,,"Just wanted to let you know that we offer a strategy call that is 100% FREE and helpful no matter what stage you're at in your clinic journey- whether you're just planning, newly launched, or trying to grow.

Worst case scenario? You learn something useful you can apply right away. Is this something you'd be interested in?",,,
"2026-02-10 09:38:08",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+12409943639,Paul,,,,,"Hey! Just following up with my last text, hope all is well :)",,,
"2026-02-10 09:43:07",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+12187668998,marnewaldo,,,,,"Hey! Just following up with my last text, hope all is well :)",,,
"2026-02-10 09:59:07",sms,outbound,invalid,"Jack's Personal Line",+18175809950,"Hiring Guide - 2026 v1.0",+18054980354,Carrie,Burgert,"Brandon Erwin",,"System: Error while sending an SMS. Landlines are not capable of receiving SMS/MMS.","Hey! Just following up with my last text, hope all is well :)",,,
"2026-02-10 10:00:11",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+17024177136,Evan,Lee,,,,"Hi Evan, this is Jack from PT Biz! I saw you just signed up for our 5-Day Challenge thank you! I'd love to hear what led you to grab it?",,,
"2026-02-10 10:00:11",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+19178345747,Lisa,Tiger,,,,"Hi Lisa, this is Jack from PT Biz! I saw you just signed up for our 5-Day Challenge thank you! I'd love to hear what led you to grab it?",,,
"2026-02-10 10:01:12",sms,outbound,failed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+13477524355,Marina,gefen,"Jack Licata",,"System: Unable to send message - carrier failed to deliver. Error: 30008 - Unknown error","Just wanted to let you know that we offer a strategy call that is 100% FREE and helpful no matter what stage you're at in your clinic journey- whether you're just planning, newly launched, or trying to grow. Worst case scenario? You learn something useful you can apply right away. Is this something you'd be interested in?",,,
"2026-02-10 10:01:13",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+15088476685,Nicole,Durning,"Brandon Erwin",,,"Just wanted to let you know that we offer a strategy call that is 100% FREE and helpful no matter what stage you're at in your clinic journey- whether you're just planning, newly launched, or trying to grow. Worst case scenario? You learn something useful you can apply right away. Is this something you'd be interested in?",,,
"2026-02-10 10:01:14",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+19548959291,Uduak,Ekpo,,,,"Hey! Just following up with my last text, hope all is well :)",,,
"2026-02-10 10:01:14",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+16824658493,Kimberly,Sowell,,,,"Hey! Just following up on my last message, totally understand things get busy.",,,
"2026-02-10 10:27:07",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+17025081500,Brian,,,,,"Hi Brian, this is Jack from PT Biz! I noticed you just grabbed our book- thank you! I'd love to hear what caught your interest. Was there a specific challenge you're looking to tackle? (And no worries, I'm a real person, not a bot!)",,,
"2026-02-10 10:51:15",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,,,,"Hi Jack—thanks! I grabbed it because I’m doing market research on what PT owners are responding to right now and I’m always refining my offer. Quick context: I’m a physical therapist turned filmmaker and I produce marketing/value videos for PT practices. Curious—do you ever partner with or refer to a video producer for your community?",,,
"2026-02-10 10:59:24",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,"Jack Licata",,,"Hey Lisa! Yes, we have an amazing creative director on staff with us at PT Biz! His name is E'an and he can be reached at: Ean@physicaltherapybiz.com",,,
"2026-02-10 11:00:10",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+18622190486,Ralph,,,,,"Just wanted to let you know that we offer a strategy call that is 100% FREE and helpful no matter what stage you're at in your clinic journey- whether you're just planning, newly launched, or trying to grow.",,,
"2026-02-10 11:02:47",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,"Jack Licata",,,"And just a heads up- those ""double dashes"" in your message (called an ""EM dash"") have become the ai bots favorite character to use, and it's now widely know and considered by many to be a tip off the person your chatting with isn't real, or they are just using ai to copy and paste replies to you. Hope this isn't coming off accusatory haha, genuinely trying to help you out in case that's the first you've heard it. (From one rep to another! 😉)",,,
"2026-02-10 11:04:52",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,"Jack Licata",,,"Definitely send him an email! I think it's so cool you have a PT background too. I think he works with a videographer usually at our live events if I'm not mistaken. Really hope all this helps!",,,
"2026-02-10 11:49:40",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,"Jack Licata",,,"Jack, you rock! 🎸 I use ChatGPT sometimes for grammar since I’m usually multitasking and typing too fast. Dashes are officially banned. Also, is it E’an or Ean?",,,
"2026-02-10 12:05:10",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+12393572977,Griffin,Urraro,"Renee Duran",,,"Hi gurraro24, this is Jack from PT Biz! I noticed you just grabbed our book- thank you! I'd love to hear what caught your interest. Was there a specific challenge you're looking to tackle? (And no worries, I'm a real person, not a bot!)",,,
"2026-02-10 12:12:34",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+19178345747,Lisa,Tiger,"Jack Licata",,,"It's E'an!! Thoughtful to ask :) I love it! It's like having something stuck in your teeth LOL, I would want someone to tell me too!!! You seem pretty awesome as well. Let me know if there is anything else I can do to help you out Lisa!",,,
"2026-02-10 12:54:10",sms,outbound,completed,"Jack's Personal Line",+18175809950,"5-Day Challenge",+14435068647,Jason,Lawrence,,,,"Hi Jason, this is Jack from PT Biz! I saw you just signed up for our 5-Day Challenge thank you! I'd love to hear what led you to grab it?",,,
"2026-02-10 13:15:03",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12102399896,Courtney,Shadrock,"Jack Licata",,,"Let’s go, I’m ready! This week I see home health patients on the side every day after my full time job so I’m not available until 7pm or after. I’m free Saturday/Sunday afternoon for a call or next Tuesday/Thursday in the PM works for me!",,,
"2026-02-10 13:20:10",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+12102399896,Courtney,Shadrock,"Jack Licata",,,"Amazing!! Let's go!!! I'll get you setup and confirmed now. You'll get a calendar invite in your email, and I'll send you a link here once it's confirmed with a bit more info about the call from our founders Danny + Yves!",,,
"2026-02-10 14:05:06",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,,,,"I have been working my side gig concierge PT business for 2 years now. Have a few clients and have made some great sales. Just at this point want the assistance and a clear vision on how to make it into my own clinic. Tired of working as a director making someone else all the money through my hard work ",,,
"2026-02-10 14:08:44",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,"Brandon Erwin",,,"I hear you man. That's a really common spot for people who've already proven they can sell and deliver. And yeah, I saw you hopped into the Circle group too which is perfect for where you're at. Besides getting clearer on the clinic piece, is there anything else you feel stuck on right now or want help pressure-testing?",,,
"2026-02-10 14:12:20",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,"Brandon Erwin",,,"I'm stuck on how to promote my business to the clientele when I'm also doing it for my current position. I don't want to step on the toes of the owner now by pushing a large marketing scheme, leading them to believe I'm out there working for myself ",,,
"2026-02-10 14:26:29",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,"Brandon Erwin",,,"Nice. That's a solid niche and it actually lines up really well with the stage you're in. At this point, it probably makes sense to pressure-test where you're at with one of our advisors.",,,
"2026-02-10 14:36:01",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,"Brandon Erwin",,,"No problem.  Your call with John Licata is locked in for Thursday the 12th at 1:00 PM EST. You're in great hands.",,,
"2026-02-10 14:37:32",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+14435068647,Jason,Lawrence,"Brandon Erwin",,,"Sounds great! Thanks for all the help today. I appreciate it",,,
"2026-02-10 18:43:04",call,inbound,completed,"Jack's Personal Line",+18175809950,,anonymous,Anonymous,Number,"Jack Licata",,,,,,https://app.aloware.com/static/recording/86fadb27-af14-415b-ada2-af625a06fd6f
"2026-02-11 07:00:06",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Standalone Space Guide - 2026 v1.0",+19288212588,Braeden,Wills,,,,"Hi Braeden, this is Jack from PT Biz! I saw you just signed up for our Standalone Space Guide- thank you! I'd love to hear what led you to grab it. Are you in the early stages of planning your practice, or already getting things rolling?",,,
"2026-02-11 08:35:58",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+13863652168,Casandra,Wheeler,,,,"Well, I never got to the space guide .  It kept wanting more information and gue me to sign up.  I didn't realize what was involved that just thought it was a freebie that would maybe give me an idea of things that I needed or overlooked I'm in the beginning stages of a small one person solo practice. Medicare and small group fitness classes for seniors.  ",,,
"2026-02-11 12:47:26",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+13863652168,Casandra,Wheeler,"Jack Licata",,,"Got it, thanks for explaining that Casandra. It shouldn't feel complicated just to get a guide! I'll personally send the Standalone Space Guide straight to your email so you have it without jumping through more steps.",,,
"2026-02-11 13:42:17",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+13863652168,Casandra,Wheeler,"Jack Licata",,,"The group fitness classes are cashed based, my Parkinson's classes will be cashed based, and I may see one on one wellness at some point all cash",,,
"2026-02-11 13:57:14",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+13863652168,Casandra,Wheeler,"Jack Licata",,,"That's a really smart way to structure it. Medicare for stability, and cash programs for margin and flexibility. Especially with Parkinson's and senior fitness, that can position you as the go-to in your area.",,,
"2026-02-12 07:24:31",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,,,,"Just starting up my own business and struggling to get clients",,,
"2026-02-12 07:26:48",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,"Brandon Erwin",,,"dang, sorry to hear you're struggling.  who's the ideal client you're looking to build around?",,,
"2026-02-12 07:39:50",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,,,,"Just someone who wants to get better",,,
"2026-02-12 07:40:05",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,,,,"Ideally more athletic/weekend warriors ",,,
"2026-02-12 07:48:09",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,,,,"Noo I am mobile. I have a table and equipment in my car that I bring into clients homes. More of an I go to you service. Eventually I would like my own space but I'm not there yet ",,,
"2026-02-12 08:02:45",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,"Brandon Erwin",,,"I know you're busy, so I'll keep this simple. This might actually make sense for you based on where you're at. you're mobile, keeping overhead low, thinking about space, trying to dial in your ideal client. That's exactly the stage where a little strategic clarity can save you a lot of time and money.",,,
"2026-02-12 08:25:01",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,,,,"I'd like to connect ya. Is it free?",,,
"2026-02-12 08:26:00",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+12393572977,Griffin,Urraro,"Brandon Erwin",,,"Yep, consults are free. Typically a 45-60 min chat.",,,
"2026-02-14 17:15:23",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+17206204445,Sarah,,,,,"Audiology ",,,
"2026-02-14 17:15:43",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+17206204445,Sarah,,,,,"There's a massive movement away from third party payers.",,,
"2026-02-14 17:34:12",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+17206204445,Sarah,,"Jack Licata",,,"That's a really fair point. In fields where services feel ""optional,"" positioning becomes everything. The clinicians who can tie what they do directly to performance, function, or quality of life usually do very well... the ones who rely on coverage tend to feel the squeeze!",,,
"2026-02-15 18:42:10",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+16023639244,Eric,Brown,,,,"Currently it's $40 for 30 minutes based out of a padel club in Tempe, AZ. Although I want to be around $60-70 for the same time since the club will offer infrared sauna or cold plunge time if they book with me",,,
"2026-02-15 19:14:56",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+16023639244,Eric,Brown,"Jack Licata",,,"Eric!!! This is like a ""dream setup"" my friend. Wow! Free space inside a niche club with built in traffic and no revenue split is rare, honestly.",,,
"2026-02-15 23:16:25",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+16023639244,Eric,Brown,"Jack Licata",,,"Haha! Well hey, I am super pumped for you that it worked out that way, and he loved your treatment so much he wanted to bring it to his club too. Great stuff man. And heard on Wed-Fri PM!! I just checked our calendar and we have an opening at 3PM (MST) time this coming Friday- 2/20!",,,
"2026-02-16 19:14:38",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+15305246613,Anthony,Agostini,,,,"I'm usually pretty good with Tuesdays or Wednesday's in the PM",,,
"2026-02-16 19:22:18",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+15305246613,Anthony,Agostini,"Jack Licata",,,"Absolutely, I am going to need you to send me like $8,000 right now.",,,
"2026-02-16 19:22:51",sms,outbound,completed,"Jack's Personal Line",+18175809950,,+15305246613,Anthony,Agostini,"Jack Licata",,,"Haha I'm kidding. Nope- totally free.",,,
"2026-02-16 19:23:09",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+15305246613,Anthony,Agostini,,,,"Laughed at “Absolutely, I am going to need you to send me like $8,000 right now.”",,,
"2026-02-16 19:23:23",sms,inbound,completed,"Jack's Personal Line",+18175809950,,+15305246613,Anthony,Agostini,,,,"Sounds good. Appreciate it. ",,,
"2026-02-17 00:08:05",sms,outbound,completed,"Jack's Personal Line",+18175809950,"Cash Practice Field Manual - 2026 v1.0",+12624173411,Adam,,,,,"Hi Adam, this is Jack from PT Biz! I noticed you just grabbed our book- thank you! I'd love to hear what caught your interest. Was there a specific challenge you're looking to tackle? (And no worries, I'm a real person, not a bot!)",,,
`;

// --- Agent Data ---
export const AGENT_STATUSES: Agent[] = [
  { id: 1, name: "Brandon Erwin", email: "brandon@ptbiz.com", agent_status: 1, human_readable_agent_status: "Available" },
  { id: 2, name: "Jack Licata", email: "jack@ptbiz.com", agent_status: 1, human_readable_agent_status: "Available" },
  { id: 3, name: "Justin Pfluger", email: "justin@ptbiz.com", agent_status: 2, human_readable_agent_status: "Away" },
  { id: 3, name: "Justin Pfluger", email: "justin@ptbiz.com", agent_status: 2, human_readable_agent_status: "Away" },
];

export const AGENT_STATUS_COLORS: {[key: number]: string} = {
  0: 'bg-gray-500', // Offline
  1: 'bg-green-500', // Available
  2: 'bg-yellow-500', // Away
  3: 'bg-red-500', // Busy
};

// --- Parsing Logic ---

// Parse a single CSV line respecting quotes
const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
};

// Parse full CSV including multiline strings
const parseCSV = (data: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        
        if (char === '"') {
            if (inQuotes && data[i + 1] === '"') {
                currentVal += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentVal);
            currentVal = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
             if (char === '\r' && data[i+1] === '\n') i++; // Handle CRLF
             
             // Push the last value of the row
             currentRow.push(currentVal);
             if (currentRow.length > 1) { // Skip empty lines
                 rows.push(currentRow);
             }
             currentRow = [];
             currentVal = '';
        } else {
            currentVal += char;
        }
    }
    // Handle last row
    if (currentRow.length > 0 || currentVal.length > 0) {
        currentRow.push(currentVal);
        rows.push(currentRow);
    }
    return rows;
};

// --- Processing Logic ---

const rows = parseCSV(CSV_DATA.trim());
const headers = rows[0]; // Header row
const dataRows = rows.slice(1);

// Helpers to find index
const getIdx = (name: string) => headers.indexOf(name);

const CONTACT_NUMBER_IDX = getIdx("Contact Number");
const CONTACT_FIRST_IDX = getIdx("Contact First Name");
const CONTACT_LAST_IDX = getIdx("Contact Last Name");
const INCOMING_NUMBER_IDX = getIdx("Incoming Number");
const BODY_IDX = getIdx("Body");
const TYPE_IDX = getIdx("Type");
const DIRECTION_IDX = getIdx("Direction");
const STARTED_AT_IDX = getIdx("Started At");
const SEQUENCE_NAME_IDX = getIdx("Sequence Name");
const CALL_DISPO_IDX = getIdx("Call Disposition");
const DISPO_STATUS_IDX = getIdx("Disposition Status");
const DURATION_IDX = getIdx("Duration"); // Assuming it might exist or we default
const RECORDING_IDX = getIdx("Recording");

// 1. Generate Contacts
const contactsMap = new Map<string, Contact>();

dataRows.forEach(row => {
    const phone = row[CONTACT_NUMBER_IDX] || row[INCOMING_NUMBER_IDX];
    if (!phone) return;

    // We keep updating the contact info as we go down the list (assuming log is chronological)
    // so the latest info is used.
    const firstName = row[CONTACT_FIRST_IDX];
    const lastName = row[CONTACT_LAST_IDX];
    const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Unknown Contact";
    
    // Only update if we have a name, or if it doesn't exist yet
    if (firstName || !contactsMap.has(phone)) {
        contactsMap.set(phone, {
            id: phone,
            phone_number: phone,
            first_name: firstName || "Unknown",
            last_name: lastName || "",
            name: name,
            tags: [],
            // Generate deterministic avatar
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
        });
    }
});

export const MOCK_CONTACTS = Array.from(contactsMap.values());

// 2. Generate Messages
export const MOCK_MESSAGES: Message[] = dataRows.map((row, idx) => {
    const phone = row[CONTACT_NUMBER_IDX] || row[INCOMING_NUMBER_IDX];
    const type = row[TYPE_IDX] as any;
    const direction = row[DIRECTION_IDX] as any;
    
    // Determine disposition for calls
    let disposition = undefined;
    if (type === 'call') {
        // Priority: Explicit "Call Disposition" column > "Disposition Status"
        disposition = row[CALL_DISPO_IDX] || row[DISPO_STATUS_IDX];
        // Map to our UI options if possible, or keep raw
        if (disposition === 'completed') disposition = 'Connected';
        if (disposition === 'no-answer') disposition = 'No Answer';
    }

    return {
        id: `msg-${idx}`,
        contact_id: phone, // Links to contact
        direction: direction,
        type: (type === 'sms' ? 'sms' : 'call') as Message['type'], // Simplify for now
        body: row[BODY_IDX] || (type === 'call' ? `Call ${row[DISPO_STATUS_IDX]}` : ''),
        created_at: row[STARTED_AT_IDX],
        duration: type === 'call' ? 120 : undefined, // Mock duration for calls since it wasn't in CSV
        disposition: disposition,
        media_url: row[RECORDING_IDX]
    };
}).filter(m => m.contact_id); // Filter out messages without contact linkage

// 3. Generate Sequences
const sequencesSet = new Set<string>();
dataRows.forEach(row => {
    const seqName = row[SEQUENCE_NAME_IDX];
    if (seqName) sequencesSet.add(seqName);
});

export const MOCK_SEQUENCES: Sequence[] = Array.from(sequencesSet).map((name, idx) => ({
    id: `seq-${idx}`,
    name: name,
    steps_count: Math.floor(Math.random() * 5) + 3,
    active_contacts: Math.floor(Math.random() * 50)
}));

// 4. Mock Enrollments (Just link some contacts to sequences found in their rows)
export const MOCK_ENROLLMENTS: Enrollment[] = [];
dataRows.forEach(row => {
    const seqName = row[SEQUENCE_NAME_IDX];
    const phone = row[CONTACT_NUMBER_IDX];
    
    if (seqName && phone) {
        const seqId = MOCK_SEQUENCES.find(s => s.name === seqName)?.id;
        if (seqId) {
            // Check if already enrolled to avoid duplicates
            if (!MOCK_ENROLLMENTS.find(e => e.contact_id === phone && e.sequence_id === seqId)) {
                MOCK_ENROLLMENTS.push({
                    contact_id: phone,
                    sequence_id: seqId,
                    status: 'active',
                    current_step: 1,
                    enrolled_at: row[STARTED_AT_IDX]
                });
            }
        }
    }
});
