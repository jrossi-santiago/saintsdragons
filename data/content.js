/* Saints & Dragons — nightly content.
 *
 * Seed content. Every card, brief, tale and date entry below is real history,
 * and is meant to be edited or replaced as the real schedule fills in. The
 * shapes are what app.js renders against:
 *
 *   CARDS   one per night, newest last. Points at a brief and a tale.
 *   BRIEFS  the history for the dad. Keyed by slug. Two shapes; see the note
 *           above BRIEFS.
 *   TALES   the read-aloud. Keyed by slug.
 *   TODAY   one entry per calendar date, keyed "MM-DD".
 *   SEVEN   the seven free stories, printed in full on #seven for everyone.
 *
 * ------------------------------------------------ writing a new history
 *
 * Follow docs/history-for-dads.md, with docs/histories/golden-hind.md as the
 * reference piece. Those are the only rules; nothing in this file is.
 *
 * The briefs already here with a flat `body` were written to an older voice
 * (the "military explainer", with Hastings as its reference), whose rules
 * lived in this header until 2026-09-23. They stay as they are, on purpose.
 * Don't "fix" them toward the new standard, and don't write new ones to the
 * old rules. The old rules are in git at commit 358a053, in this file.
 *
 * The TALES are read-aloud stories for children and are governed by neither.
 */

/* Chronological, and the shelf draws them in this order. Two were added after
   an audit found briefs stranded in "And everything else" for want of a bucket:
   "After Rome" for late antiquity (Patrick, and Benedict and Columba when they
   are written), and "Kings and gunpowder" for the early modern centuries, which
   Lepanto and Vienna had been sitting outside of. "And everything else" stays
   as the catch-all and currently holds nothing, which is the point of it. */
const ERAS = ["Greece and Rome", "After Rome", "Knights and lords", "Kings and gunpowder", "The 1700s", "The 1800s", "1900 to 1950", "And everything else"];
const KINDS = ["A person", "A battle", "A saint", "A council", "A builder", "A mother", "A heresy", "A feast"];
/* Two axes, deliberately separate, because they answer two different questions
   a reader actually asks. THEMES is what is IN the story — "one with knights in
   it" — imaginative furniture a child picks by. VIRTUES is what the story is
   ABOUT — "one about telling the truth tonight" — which is the axis a parent
   picks by, and the one that makes this more than fun facts.

   They were one list until now, which mixed the two and made both weaker. Both
   are filters on the bedtime shelf, in two labelled rows.

   A tale must carry a `virtue`. `theme` is optional: a couple of tales (the
   dome, Cincinnatus) are history-shaped and have no fantasy furniture in them,
   and filing them under a theme they do not have would be a lie told to make a
   chip row look tidy. They are still reachable by virtue, by age and by search. */
const THEMES = ["Knights", "Dragons", "Forests", "Castles", "Princes and princesses", "The sea"];
/* A tale's `age` is a bucket id, not a number of years — band 1 is a four to
   six year old, band 3 is a seven to nine year old. Two tales already carried
   an `ageLabel` saying "Ages 4–6" on an `age: 1` tale, while the shelf printed
   "Age 1" for the same story; the number was never meant to be shown. Every
   surface now prints the label from here and never the id, so the two cannot
   drift apart again. `ageLabel` on a tale still overrides it — see the note on
   it in TALES — for the story that does not sit squarely in its band.

   The ids are sparse on purpose: bands for older readers slot in between and
   above without renumbering what is already filed. */
const AGE_BANDS = {
  1: "Ages 4–6",
  3: "Ages 7–9"
};

const VIRTUES = ["Courage", "Obedience", "Mercy", "Honesty", "Humility", "Perseverance", "Forgiveness", "Faithfulness"];

/* ---------------------------------------------------------------- briefs */

/* Two shapes, and the renderer takes either.

   The briefs written before 2026-09-23 carry a flat `body`: an array of
   paragraphs. They stay that way. Do not convert them.

   A history written to docs/history-for-dads.md carries its parts instead:

     dek            the bold who/what/when line under the title
     opening        the paragraph with no header
     sections       [{ heading, body: [paragraphs] }], in the standard's order,
                    ending with "For the dinner table"
     sideNotes      [{ lead, text }], 6 to 8; lead is the bold lead-in

   Both shapes keep title, hook, era, kind, minutes and (optionally) tale and
   stillWithUs, which is all the shelf, the receipt, search and the filters
   read. `*word*` in a new-format brief prints in italics (ship names).
   A locked brief loses body, opening, sections and sideNotes;
   see api/_lib/content.js. The dek stays, like the title. */

const BRIEFS = {
  "lepanto": {
    title: "The Battle of Lepanto, 1571",
    era: "Kings and gunpowder",
    kind: "A battle",
    minutes: 3,
    hook: "The last great battle fought by oared galleys, and the last decided by men crossing from one deck to another. Both fleets moved by muscle: three or four men to an oar, and most of them chained to the bench.",
    stillWithUs: "A ship\u2019s kitchen is still called the galley.",
    body: [
      "A war galley was not a sailing ship that happened to carry oars. It was a rowing machine about a hundred and fifty feet long, with twenty-five or thirty oars a side and three or four men on each, pulling to a drum. In both fleets at Lepanto most of those men were slaves or convicts, chained at the ankle, unable to see out.",
      "That engine dictated everything else. A galley could move in a flat calm and hold its place in a line, which no sailing ship of the period could do, but it had to carry food and water for three or four hundred men in a hull built for speed. So galley fleets hugged coastlines, never strayed far from a friendly port, and fought where the coast forced them together. On 7 October 1571 that meant the Gulf of Patras, off the west coast of Greece, where about four hundred ships and roughly a hundred and forty thousand men found each other.",
      "Gunpowder had reached the galley without changing what it was for. A galley still won by ramming or by coming alongside and sending men across, and its guns pointed forward, over the bow, because that is where the enemy was. The trouble was the ram itself. It stuck out of the bow and it sat low, which tilted the whole forward battery up at the sky. Don John of Austria, who commanded the Christian fleet, had the rams sawn off his galleys. With the beak gone the guns could fire flat, into the waterline of anything rowing at him.",
      "He did something stranger with six Venetian galleasses. A galleass was a merchant hull converted to war, too heavy to row properly and useless in a line, but it carried guns on every side instead of only forward. Don John had them towed out ahead of his fleet and left there. They were not ships in the battle so much as six artillery positions anchored in the water the Ottoman fleet had to row through.",
      "The command was the other problem he had to solve. Don John was twenty-four, the illegitimate son of an emperor, and he held the job largely because Venice, Spain and Genoa would not serve under one another. An alliance that distrusts itself needs a commander its captains can physically see, so before the fighting he took a fast boat down the line of ships so the men could look at him. He also had the chains struck off his own rowers and promised them their freedom.",
      "Ali Pasha brought the Ottoman fleet on in a crescent and rowed it straight into the galleasses, which cost him something like seventy ships before the lines ever met. Then the lines met, and the battle stopped being naval. Grappled together, two galleys become one wooden floor with infantry fighting across it, and the fighting went on like that for four hours. One of the wounded was a twenty-four-year-old Spanish soldier with a fever, ordered to stay below deck, who went up anyway, took three gunshot wounds and never used his left hand again. Thirty-four years later Miguel de Cervantes wrote Don Quixote, and he stayed proud of the hand.",
      "It ended in the early afternoon. Boarders took the Ottoman flagship and killed Ali Pasha, and the victors towed away about a hundred and twenty galleys intact. Some twelve thousand Christian galley slaves came up off the benches and walked away free.",
      "It mattered less than the celebrations suggested, because the Ottomans rebuilt their navy inside a year. What Lepanto killed was not a fleet but an assumption \u2014 that the fleet coming west could not be stopped. It also came close to killing the galley. Within a couple of generations sailing warships carrying guns along both sides made the oared fleet obsolete, because a ship with a broadside does not need to close with anything to destroy it, and does not need three hundred men chained below to move."
    ]
  },

  "vienna": {
    title: "The Siege of Vienna, 1683",
    era: "Kings and gunpowder",
    kind: "A battle",
    minutes: 3,
    hook: "Ottoman siege engineering did not attack walls. It went underneath them. For two months the tunnels crept toward Vienna\u2019s defences, and the garrison fought most of the siege underground and in the dark.",
    stillWithUs: "The story that the croissant was invented at this siege is almost certainly false, and people still tell it.",
    body: [
      "In July 1683 Vienna held about fifteen thousand defenders behind walls that were good but not new. Outside sat an Ottoman army of perhaps a hundred and fifty thousand under the Grand Vizier Kara Mustafa.",
      "He did not storm the walls, because storming walls kills the men doing it. He dug. Ottoman siege engineering was the best in the world and it worked on a simple observation: a wall resists what comes at its face and nothing else. So the engineers drove tunnels forward, packed the ends with gunpowder, and brought the defences down from beneath. The trenches crept in for two months. The defenders answered the only way anyone could, by digging their own tunnels to intercept, which meant fighting underground in the dark with the roof low enough to touch. By early September the outer works had holes in them and the garrison was down to roughly four thousand men who could still fight.",
      "Vienna had sent for help in July. Getting it meant assembling an army out of the German princes and Poland, which meant finding a commander all of them would actually obey. That was John III Sobieski, King of Poland.",
      "Sobieski brought the Polish winged hussars, and the hussar was built around his lance. It ran nineteen feet, far longer than anything a rider could normally control, and the Poles hollowed it out to keep the weight down and built it to shatter on impact. A lance that breaks has done its job: it delivers the shock and then stops being a nineteen-foot pole in a melee, which leaves the rider free to work with the sabre, war hammer and two pistols he was also carrying. On his back or his saddle he wore a wooden frame of eagle feathers, and nobody agrees what those were for. The usual answers are the noise they made and the fact that they made horse and rider look much bigger.",
      "On 11 September the relief army came over the Vienna Woods, steep forested ground that nobody expected an army with artillery to cross. They hauled the guns over by rope. The ground was the point: an army besieging a city faces inward, with its lines, its guns and its whole attention pointed at the walls, and Kara Mustafa now had to turn all of it round.",
      "The fighting took most of 12 September, with infantry working down through the vineyards on the slope. In the late afternoon Sobieski formed up about twenty thousand cavalry on the high ground, three thousand of them hussars, and sent them into the Ottoman flank. It remains the largest cavalry charge anyone has ever made. Within three hours Sobieski was standing in Kara Mustafa\u2019s tent.",
      "Kara Mustafa reached Belgrade, where the Sultan had him strangled with a silk cord, the customary end for a defeated commander of his rank. Sobieski wrote to his wife the next day. He was fifty-four and had been riding for weeks, and the letter is mostly about the tent, the horses, and a parrot that got loose in the confusion.",
      "The Ottoman empire had been pushing west for three hundred years. From that autumn it went the other way, and kept going the other way for the next two centuries."
    ]
  },

  "tours": {
    title: "Charles Martel at Tours, 732",
    era: "Knights and lords",
    kind: "A battle",
    minutes: 3,
    hook: "Umayyad cavalry had beaten every army it met by the same method: charge the line, break it, and kill the men once they were running. Charles built his entire week around denying it the break.",
    stillWithUs: "His nickname ended up as his grandson\u2019s name. Charlemagne is just Charles the Great.",
    body: [
      "In October 732, on wooded ground between Tours and Poitiers, a Frankish army stood on a hill for seven days and refused to come down.",
      "The man who put them there was Charles, mayor of the palace. The Frankish kings of that generation did almost nothing: servants carried them about in ox carts and they produced heirs, while an official whose job had begun as household steward ran the government. Charles held that job. He was also the most experienced soldier in western Europe, and he had one thing nobody else in the West had \u2014 a standing army of full-time professional infantry. Full-time soldiers cost money he did not have, so he confiscated church lands to pay and equip them, and the chroniclers who praised him for the battle never quite forgave him for the funding.",
      "Coming north was an Umayyad force under Abd al-Rahman al-Ghafiqi, the governor of al-Andalus. It was mostly cavalry and it was very good, and its method had worked for a century. Ride at the enemy line; the line, usually a levy of farmers, breaks; then ride the men down from behind. That last step is the one that matters. Most casualties in a medieval battle happen after one side turns and runs, which means cavalry does not have to kill an army. It only has to frighten one into running.",
      "Charles spent the week attacking each part of that sequence. He marched on back roads and put himself between the raiders and Tours, so his position came as a surprise and Abd al-Rahman could not choose the ground. He took high wooded ground, because cavalry coming uphill arrives slowly and trees break a charge into pieces before it lands. He packed his infantry into a dense square and told them to hold, which removes the break the whole Umayyad method depends on. Then he waited seven days while the weather turned colder. His men had cloaks. Cavalry raiding up from the south in autumn did not.",
      "Abd al-Rahman had to attack in the end, and a chronicler wrote that the Franks stood like a wall, like a belt of ice frozen together. The cavalry came up the hill and did not break the square.",
      "What broke instead was the Umayyad army\u2019s reason for being there. Scouts Charles had sent round the flank got into the camp and started freeing prisoners, and word went through the cavalry that the camp was being taken. A raiding army holds together because of what it is carrying, so a good part of it broke off mid-battle to ride back and save the plunder. Abd al-Rahman tried to stop them, was surrounded and was killed. By morning the camp stood empty, and the Franks scouted all day before they believed it.",
      "Charles was called Martel afterwards, the Hammer. Whether the battle saved Europe is argued about, and the honest answer is that it was one of several. What happened at home is not in doubt. Charles ended the day as the only real power in Francia, his son P\u00e9pin took the crown outright, and his grandson was Charlemagne."
    ]
  },

  "dome": {
    title: "Brunelleschi and the Dome of Florence, 1420",
    era: "Knights and lords",
    kind: "A builder",
    minutes: 3,
    hook: "Florence approved a dome nobody knew how to build, and the problem was never the finished dome. It was how to hold the masonry up during the years before it could hold itself up.",
    stillWithUs: "Four million bricks, no steel, six hundred years. It is still the largest masonry dome in the world.",
    body: [
      "In 1367 Florence approved a design for its cathedral with a dome a hundred and forty-three feet across. Nobody in Europe knew how to build a dome that size. The city approved it anyway, on the assumption that somebody would work it out before they got to the top. They built the rest of the cathedral and got to the top. By 1418 a church stood in the middle of Florence with an octagonal hole in its roof a hundred and forty feet up, open to the weather, and it had been like that for years.",
      "The obstacle was a piece of ordinary building physics called centering. A masonry arch does not stand until the last stone goes in \u2014 until then every stone in it is trying to fall inward \u2014 so every vault in Europe went up on a full wooden skeleton that held the stone in place until the mortar cured. Centering a dome this size needed more timber than Tuscany had, and it needed a scaffold rising from the cathedral floor a hundred and forty feet below. Anyone who costed it honestly came back with a number the city would not pay.",
      "The city held a competition in 1418. One entry came from Filippo Brunelleschi, a goldsmith by training, difficult and secretive, who had lost the competition for the baptistery doors twenty years earlier, gone to Rome, and spent years measuring the ruins. He said he could build the dome with no centering at all. He would not say how, and his argument for not saying was that if he explained the method they would thank him and then dismiss him.",
      "This is where the egg comes in. Vasari tells the story a century later, so it has probably been improved. The judges pressed him, and Brunelleschi proposed instead that whoever could stand an egg upright on a slab of marble should get the commission. Everyone tried and failed. He took the egg, cracked its base flat on the marble, and stood it up. The others said they could have done that. He said they would say the same about the dome.",
      "He got the job, jointly with his old rival Ghiberti, which he resented for the rest of his life. His method was four ideas working together. He built two shells, inner and outer, braced to each other, so the weight came down through ribs instead of pressing as one dead mass. He laid the brickwork in a herringbone pattern, setting bricks vertically at intervals to lock each course and stop the courses above from sliding inward before the mortar set \u2014 and that is the trick that replaces the centering, because each ring closes on itself and carries its own weight the moment it is finished. He wrapped rings of sandstone and iron cramps around the base like a barrel hoop, because a dome pushes outward at the bottom and something has to hold it in. And he built an ox-driven hoist with a reversible gear, so one team could raise and lower loads all day without being unhitched and turned round.",
      "It took sixteen years. He kept food and wine up on the platforms so the masons would not spend half a day climbing down and back for lunch, and he watered the wine. Four million bricks went up. The masons closed the dome in 1436, and Brunelleschi was buried underneath it, though nobody knew exactly where until workmen found the grave during excavations in 1972.",
      "Six hundred years later it still stands, and it still holds the record. No dome built of brick and stone has ever been made larger, because nobody has found a reason to try since steel and concrete made the problem Brunelleschi solved stop being a problem."
    ]
  },

  "athelney": {
    title: "Alfred the Great and the Winter of 878",
    era: "Knights and lords",
    kind: "A person",
    minutes: 3,
    hook: "A surprise attack at Christmas cost Alfred his kingdom, because a country defended by farmers is undefended in the season when the farmers are at home. What he built afterwards was a set of answers to exactly that.",
    stillWithUs: "He had the law and the histories put into English because he thought a country that cannot read its own language stops being one.",
    body: [
      "The Great Heathen Army landed in England in 865. Within ten years it had ended three of the four English kingdoms \u2014 Northumbria, East Anglia and Mercia were gone \u2014 and by the winter of 877 only Wessex was left, under a young king named Alfred who had been buying time with money for years.",
      "In early January 878 the Danish leader Guthrum broke the truce and attacked Chippenham during the twelve days of Christmas. He picked the date deliberately. Nobody campaigned in January, the king\u2019s household was scattered, and the men who made up the army were at home on their farms, which is the standing weakness of any kingdom defended by part-time soldiers. It worked. Alfred got out into the Somerset Levels with what one chronicle calls a small company.",
      "The Levels in winter were not farmland. They were flooded marsh, reeds and alder, crossed by paths a man had to know, with occasional islands of dry ground. That terrain is useless to a raiding army and perfect for a hunted one: horses become a liability, and local knowledge counts for more than numbers. Alfred spent about three months on one of those islands, at Athelney, raiding for supplies.",
      "The burnt cakes belong here. A century later a monk wrote that Alfred sheltered in a swineherd\u2019s cottage, and the wife, not knowing who he was, set him to watch loaves baking on the hearth. He let them burn and she told him off. It is almost certainly invented. It has lasted a thousand years because it is the only story about a king that starts with him ruining the dinner.",
      "In May he came out. He sent word through the shire levies, the men who farm and are called up, to meet him at Egbert\u2019s Stone. Asser says the men of Somerset, Wiltshire and Hampshire came and were glad to see him, because they had thought he was dead. Two days later he broke Guthrum\u2019s army at Edington, followed the survivors to Chippenham, and sat outside for fourteen days until they gave in.",
      "Then he did the thing that actually distinguishes him. He did not execute Guthrum. He stood godfather at his baptism, kept him at court for twelve days, gave him presents and sent him home to rule East Anglia under a treaty with a drawn border. That was not softness. A Danish king inside the settlement, bound by an agreement and with something to lose, was cheaper and steadier than a dead one and a new one every spring.",
      "He spent the next twenty years building answers to January 878, and each piece fixes a specific failure. He put up a ring of fortified towns, the burhs, laid out so that no part of Wessex sat more than a long day\u2019s walk from a wall, which meant raiders could no longer move faster than the defence could gather. He split the army in half, so one half was always in the fields and the other always under arms \u2014 that solved both the food supply and the Christmas problem at once. He had ships built longer than the Danish ones. He assembled a law code out of the older English codes.",
      "He also learned Latin in his thirties and translated books himself, in the evenings. He wrote that when he came to the throne he could not think of one man south of the Thames who could translate a letter. He was ill for most of his adult life with something that caused him serious pain, and he did the translating anyway."
    ]
  },

  "cincinnatus": {
    title: "Cincinnatus, Dictator of Rome for Sixteen Days",
    era: "Greece and Rome",
    kind: "A person",
    minutes: 3,
    hook: "Rome built its constitution to stop any one man taking power, which made it very good against tyranny and very bad in an emergency. So the Romans wrote themselves a trapdoor.",
    stillWithUs: "Cincinnati is named after him, by army officers who thought Washington had done the same thing.",
    body: [
      "Men who were frightened of kings built the Roman Republic. They had thrown one out, and the constitution they wrote afterwards was one long argument about making sure nobody became another. They split the top office between two consuls who could each veto the other, and they let them hold it for one year only.",
      "That arrangement prevents tyranny well and handles an emergency badly, because two men with mutual vetoes cannot decide anything quickly. So the Romans built a trapdoor into it. In a crisis the Senate could name a dictator: one man, no colleague, no veto, total authority over the state and the army. The office lasted six months at most and then expired on its own. The expiry is the whole design \u2014 absolute power that switches itself off without anyone having to take it back.",
      "In 458 BC they used it. The Aequi had trapped a Roman consular army in a valley, and five horsemen had ridden out through the enemy line to bring the news. The Senate sent a delegation across the Tiber to a farm of about four acres, worked by a former consul named Lucius Quinctius Cincinnatus.",
      "Livy says they found him at the plough. He asked whether everything was all right, then called to his wife Racilia to fetch his toga from the hut so that he could hear the Senate\u2019s message properly dressed. They told him he was dictator of Rome.",
      "He went into the city, called up every man of military age, and told each of them to bring five days of cooked rations and twelve stakes. The stakes are the plan. He marched that night, reached the valley in the dark, put his men in a ring outside the enemy and had them dig. The Aequi had surrounded a Roman army; they woke up surrounded themselves, by a ditch and a palisade thrown up overnight by men who had carried the palisade with them. They surrendered before the end of the day.",
      "He made the defeated pass under a yoke, three spears set in a low doorway a man had to stoop to walk through. It was meant to humiliate and not to kill. He took no land and executed nobody.",
      "Then he went back to Rome, held a triumph, resigned the dictatorship and returned to the farm. The whole thing took about sixteen days. He had five and a half months of absolute power left and no use for it.",
      "Whether any of the detail is true is a fair question. Livy wrote four hundred years later, at the exact moment an emperor was replacing the Republic, and the story is very neat. The Romans told it hardest when they were losing the thing it described.",
      "In 1783 George Washington won a war, resigned his commission and went home to farm. The officers who had served under him formed a society and named it after Cincinnatus, and some of them later founded a city in Ohio and gave it the same name. George III is supposed to have said that if Washington gave up power he would be the greatest man in the world."
    ]
  },

  "hastings": {
    title: "The Battle of Hastings, 1066",
    era: "Knights and lords",
    kind: "A battle",
    minutes: 5,
    hook: "Two armies built to fight in incompatible ways met on a ridge north of Hastings on 14 October 1066. The fighting lasted from nine in the morning until dusk, which was extraordinarily long for the period, because neither system could quickly undo the other.",
    stillWithUs: "Nearly every English word for meat at the table \u2014 beef, pork, mutton \u2014 comes from the French the Normans brought. The animals in the field kept their old English names: cow, pig, sheep.",
    body: [
      "Harold Godwinson\u2019s men fought on foot, in line, with spears and two-handed axes, and they carried almost no bows. Half of William of Normandy\u2019s force also fought on foot; the other half rode horses or shot arrows. Those two systems cancel each other almost perfectly, which is why a battle that both sides expected to settle in an hour or two ran all day.",
      "England had no machinery for settling a disputed succession, and when Edward the Confessor died childless on 5 January 1066 three men had arguable claims. Harold, the richest noble in England, had himself crowned the next morning. Harald Hardrada of Norway invoked an old treaty between two Scandinavian kings. William claimed a promise from Edward and an oath Harold had sworn him over relics. No court existed to choose between them, so armies decided it.",
      "William could not cross until the wind let him, and that one constraint shaped everything after it. His fleet waited at the Dives and then at Saint-Val\u00e9ry through August and most of September, eating its way through the supplies. Harold had to hold the coast against him using the fyrd, the shire levy, which owed a fixed term of service and nothing beyond it. On 8 September the term expired, the provisions ran out with it, and the men went home for the harvest. A defence built on part-time soldiers cannot stay mobilised indefinitely, and William\u2019s delay simply outlasted it. When the wind turned he came ashore at Pevensey on 28 September and met nobody at all.",
      "Harold was three hundred miles away by then. Hardrada, with Harold\u2019s exiled brother Tostig, had landed in Yorkshire and destroyed the northern levies under Earls Edwin and Morcar at Fulford on 20 September. Harold drove his household troops north from London faster than anyone has satisfactorily explained, roughly 185 miles in four or five days, and caught the Norwegians strung out and half-armed at Stamford Bridge on 25 September. He killed Hardrada and Tostig, and the survivors sailed home in twenty-four ships out of three hundred. Speed on that scale costs something, though. His professionals fought two actions in five days and then marched the length of England again, and the northern levies that should have thickened his line in Sussex lay dead at Fulford.",
      "What Harold built on the ridge was a machine for cancelling cavalry. Shields overlapped, ranks pressed close, and the whole formation rested on one condition: no man steps out of it. A horse will not run into a solid line. So long as the line held, William\u2019s knights could only ride up, fail to make contact, and ride away, and Harold\u2019s housecarls could work their axes into anything that came close enough \u2014 the Danish axe was heavy enough to bring down a horse, and the man swinging it needed both hands and a step of room. William\u2019s archers faced the mirror image of the same problem. Shooting uphill they either struck raised shields or sailed clean over the formation, and because the English had brought almost no bows, no spent arrows lay on the ground for the Normans to gather and send back. He was attacking a problem that force could not solve.",
      "So he attacked in sequence instead: archers to make the shields come up, infantry to close and hold the front, cavalry into whatever gap the first two opened. It failed all morning. Nobody breaks a shield wall from outside while it holds \u2014 the wall has to be persuaded to stop being a wall, and eventually it was. The Bretons on William\u2019s left gave way and ran, a report went round that William was dead, and he shoved his helmet back off his face and rode down his own line to be recognised. English troops chased them down off the ridge, and on level ground, out of formation, cavalry killed them easily. Norman writers claim William then staged the retreat deliberately, twice more. Historians doubt it, because a feigned flight is hard for eleventh-century cavalry to bring off under contact and because chroniclers liked the story. Either way each pursuit cost Harold men he could not replace, and a wall with fewer men in it covers less ground.",
      "Harold died late in the day and nobody can establish how. The Bayeux Tapestry shows a figure taking an arrow in the eye beneath the words Harold rex interfectus est; the Carmen de Hastingae Proelio has four knights ride him down and mutilate the body. The arrow may not even be original, since a nineteenth-century restorer reworked that stitching. None of the witnesses is neutral either: William of Poitiers wrote for the winner, and William\u2019s half-brother Odo of Bayeux commissioned the Tapestry.",
      "Winning the battle did not give William the country, and he took it by the same kind of arithmetic. Ten thousand men cannot hold two million people, so he built castles \u2014 cheap motte-and-bailey works of earth and timber that a garrison could throw up in a fortnight and that gave a few dozen horsemen somewhere to retreat to. Several hundred went up in twenty years. When the north rose again in 1069 he starved it instead, burning the country between York and Durham so thoroughly that Domesday Book still recorded those villages as waste seventeen years later.",
      "Then he gave England to his own men. At the Domesday survey of 1086, roughly 190 major tenants held land directly from the king and only a handful were English; no comparable transfer has happened here before or since. Their language went with the land. Norman French ran the government, the law and the great households, and it stayed the language of the royal courts until 1362. The Bayeux Tapestry shows the arrangement in miniature \u2014 seventy metres of wool embroidery worked, almost certainly, by English hands in Canterbury, for a Norman who wanted the story told his way."
    ]
  },

  "patrick": {
    title: "Patrick in Ireland, the 430s",
    era: "After Rome",
    kind: "A saint",
    minutes: 4,
    hook: "Fifth-century Ireland had no cities, no roads and no court a stranger could appeal to. A man standing outside his own kin-group had no legal standing at all, which made a foreign missionary less hated than simply unprotected.",
    stillWithUs: "The snakes are a later invention. Ireland has had no snakes since the last ice age, and people repeat the story every March anyway.",
    body: [
      "Two documents survive that Patrick wrote himself: a short account of his life he called the Confessio, and an angry open letter to a British warlord named Coroticus. Almost everything else attached to his name — the snakes, the shamrock, the fire on the hill at Slane — comes from monks writing two or three centuries after he died, in houses that had an interest in claiming him.",
      "The Confessio gives the outline. Patrick grew up British and Roman, the son of a town councillor, in the last decades when Britain still counted as a Roman province. Irish raiders took him off his father's estate at about sixteen and sold him inland. He spent six years herding animals on a hillside, learned the language from the people who owned him, and then walked something like two hundred miles to the coast, talked his way onto a ship, and got home.",
      "Then he went back. He was a free man in his forties, in a country that had taken six years of his life, and he crossed the water again on purpose. The Confessio spends more time defending that decision to his critics in Britain than explaining it.",
      "What he was walking into had no shape a Roman would recognise. Ireland had never been invaded by Rome, so it had no cities, no roads, no coinage and no central authority. Perhaps a hundred and fifty small kingdoms, each one a kin-group under its own king, covered the island. Law was administered by professional jurists and it ran on compensation rather than punishment: kill a man, and his kin collect his honour-price from yours.",
      "That system decides everything about how an outsider survives in it. A man's safety was a direct function of how many relatives would come collecting if somebody killed him. Patrick had none on that island. He was not protected by a bad law; he was outside the law, and anyone who killed him owed nothing to anybody.",
      "So his method followed from the problem. He bought protection, and he is candid about it — he gave gifts to kings, paid the jurists, and hired the sons of kings to travel with him as an escort. He reckons the total at about the price of fifteen men. He was not buying converts. He was buying the right to stand in a place and not be killed for free.",
      "He also aimed at the top of each kingdom rather than the bottom. A kin-group followed its king, so baptising a king's household brought a territory with it, and the daughters of noble families who took vows gave him permanent households in places he could not otherwise stay. It was the only method the political structure allowed. There were no towns to preach in.",
      "Christianity everywhere else in the west travelled on Roman administration. A bishop sat in a city, dioceses were drawn over Roman provinces, and the church inherited a filing system that already worked. Ireland had no cities to put a bishop in, so within two generations the church there reorganised itself around monasteries and their abbots, mapped onto the kin-groups that actually held the country together.",
      "That shape turned out to travel. Irish monasteries sent men back out for the next three centuries — Columba to Iona, Columbanus into Gaul and northern Italy — founding houses and copying manuscripts through the decades when the Roman schools on the continent had stopped. The church built without Roman infrastructure outlasted the one built on it."
    ]
  },

  "golden-hind": {
    title: "The Pirate the Queen Knighted",
    dek: "Francis Drake sails around the world, 1577–1580",
    era: "Kings and gunpowder",
    kind: "A person",
    minutes: 5,
    hook: "One small English ship sailed all the way around the world, and on the way robbed Spain's Pacific treasure fleet of the biggest haul anyone had ever taken. The Queen came aboard to knight her captain. Spain called him a pirate.",
    opening: "An English sea captain took a ship about 100 feet long around the entire planet. On the way he robbed Spain's Pacific treasure fleet, and he came home so rich that his investors made 47 times their money. The Queen paid off her whole national debt with her share.",
    sections: [
      {
        heading: "Why he did it",
        body: [
          "It was part business, part revenge and part cold war. In 1494 the Pope had divided the non-European world between Spain and Portugal, leaving England to watch Spain ship silver out of the Americas by the ton. Drake also had a personal grudge. In 1568 the Spanish had attacked his cousin's fleet in Mexico during a truce, and Drake barely escaped. That fleet was trading slaves, which is worth saying plainly.",
          "Queen Elizabeth, a Protestant, was heading toward war with Catholic Spain, and she backed Drake quietly. On paper he was leading a trade expedition. In private she told him she'd \"gladly be revenged on the King of Spain.\" If he got caught, he was a pirate. If he won, he was hers."
        ]
      },
      {
        heading: "How he did it",
        body: [
          "He left Plymouth in December 1577 with five small ships and about 164 men. In Argentina he beheaded his co-commander, Thomas Doughty, for mutiny. Then he told the crew that from now on, gentlemen would \"haul and draw with the mariner.\" Everyone pulls a rope.",
          "Storms after the Strait of Magellan broke up the fleet until only his flagship was left. He had just renamed her from the *Pelican* to the *Golden Hind*, after the crest of his patron. The storms also pushed him far enough south to see where South America ends. That stretch of water is still called the Drake Passage.",
          "In the Pacific he raided his way up the coasts of Chile and Peru, where no enemy had ever shown up. Then he caught the treasure galleon nicknamed *Cacafuego*, roughly \"Fire-Crapper.\" She carried 26 tons of silver and half a ton of gold, the biggest haul anyone had ever taken.",
          "Every Spanish ship in the Pacific was hunting him, so he didn't go back the way he came. He sailed north, landed in California in 1579 and claimed it for England. Then he crossed the Pacific, loaded six tons of valuable cloves in the Spice Islands, rounded Africa and reached Plymouth in September 1580 with 56 men. His first question on reaching England was reportedly whether the Queen was still alive. If she wasn't, he'd likely hang as a pirate."
        ]
      },
      {
        heading: "The rest of the story",
        body: [
          "Elizabeth came aboard the *Golden Hind* to knight him, and she had the French ambassador do it, which made France share responsibility for honoring Spain's worst enemy. In 1587 Drake raided the harbor at Cádiz and burned dozens of ships being built to invade England. He called it \"singeing the King of Spain's beard.\" When that invasion, the Spanish Armada, finally came in 1588, he was second-in-command of the fleet that beat it. The Spanish called him *El Draque*, the Dragon. He died of dysentery off Panama in 1596 and was buried at sea in a lead coffin that's never been found."
        ]
      },
      {
        heading: "Where it fits",
        body: [
          "Magellan's crew had gone around the world 60 years earlier, but Magellan died on the way. Drake was the first captain to lead a voyage around the world and live to bring it home, and his voyage came right before England's big turning points: the Armada in 1588, the East India Company in 1600 and Jamestown in 1607. It's the moment England stopped being a small island everyone else ignored and started acting like a sea power."
        ]
      },
      {
        heading: "Why it matters today",
        body: [
          "It's part of the reason you speak English. England's rise at sea, which eventually put English speakers in North America, India and Australia, starts here. It also started a financial habit. Some of the Queen's profit went into a trading venture, and the economist John Maynard Keynes traced the beginning of Britain's overseas investment empire to Drake's loot. And it shows how history depends on who tells it: to England, Drake is a national hero, and to Spain he was a pirate. Both are true."
        ]
      },
      {
        heading: "For the dinner table",
        body: [
          "Drake's Bay and Sir Francis Drake Boulevard near San Francisco are named after him. A chair made from the ship's timbers sits in Oxford's library, and a full-size replica you can walk aboard is docked in London."
        ]
      }
    ],
    sideNotes: [
      { lead: "The tree in Panama.", text: "Drake first saw the Pacific in 1573 from the top of a tree in the Panama jungle, and he vowed to sail an English ship on it. He got there with help from the Cimarrons, escaped African slaves who knew the land and hated Spain as much as he did." },
      { lead: "The name change may have been an apology.", text: "The executed Doughty was a friend of Sir Christopher Hatton, the patron the *Golden Hind* was named after. Many historians suspect Drake picked the new name partly to smooth that over." },
      { lead: "Stuck on a reef.", text: "On the way home the ship ran aground in Indonesia. The crew threw three tons of cloves and eight cannons overboard, and the next day the wind shifted and floated her off." },
      { lead: "Maybe the first museum ship.", text: "After the voyage the *Golden Hind* stayed on public display in London for about 70 years, until she rotted away." },
      { lead: "The game of bowls.", text: "The legend says Drake heard the Armada had been sighted and insisted on finishing his game before sailing out. It's almost certainly made up, and he'd have loved that it stuck." },
      { lead: "The fake brass plate.", text: "In 1936 a brass plate \"left by Drake\" turned up in California and was treated as real for 40 years. It turned out to be a hoax that began as a joke among history professors." },
      { lead: "The replica went to California.", text: "The London replica sailed to San Francisco in 1975, close to where Drake had landed four centuries earlier." },
      { lead: "Drake's Drum.", text: "His drum is kept at his old house in Devon. Legend says it will beat by itself when England is in danger, and people claimed to hear it during both World Wars." }
    ]
  }
};

/* ----------------------------------------------------------------- tales */

/* `origin` is the tale's provenance in four or five words, and it is printed on
   every surface a reader meets a tale on: the receipt, the bedtime shelf, the
   detail page. Where a tale is traditional it names the source and the date
   ("Aesop, roughly 600 BC"); where it was written for this, it says so and
   names the history it was written from ("New tale, from Vienna, 1683").
   `source` is the optional long form — one sentence, detail page only — which
   says plainly what is inherited and what is invented. Neither field drives a
   filter; both are searched. Keep them true. A provenance line that overstates
   is worse than no provenance line at all. */
const TALES = {
  "boy-who-counted-oars": {
    title: "The Boy Who Counted Oars",
    age: 3,
    minutes: "10",
    theme: "The sea",
    virtue: "Perseverance",
    origin: "Original story, based on Lepanto, 1571",
    source: "Tomas is invented. The galley, the drum, the men chained to the benches and the morning somebody struck the pins out are not.",
    body: [
      "There was once a boy named Tomas who was small for his age and good at counting.",
      "He lived by the sea, in a town where the fishing boats came in at dusk, and he had a trick he did every evening. He would stand on the wall at the end of the harbour and count the oars of every boat that came home. Six oars. Four oars. Eight oars on the wide one that belonged to the man with the beard.",
      "His mother said it was a silly way to spend an evening. His father said nothing, because his father was at sea.",
      "One evening a boat came in that Tomas did not know, low in the water and rowed badly, and when it bumped against the wall the men who climbed out had irons still locked around their ankles with the chain cut short.",
      "They sat down on the stones and did not speak for a long while. Then the oldest of them looked up and saw the boy.",
      "\"You were counting,\" he said.",
      "\"I count all of them,\" said Tomas.",
      "\"Count us, then.\"",
      "Tomas counted. There were nine.",
      "\"There were two hundred,\" said the old man.",
      "And because Tomas said nothing at all, which is sometimes the wisest thing a boy can do, the old man told him the story.",
      "They had been rowers, he said, on a great ship with a hundred and fifty oars, and they had been chained to their benches for so long that they had forgotten the colour of the sky. They rowed to a drum. When the drum went fast they went fast. When it went slow they went slow. They never knew where they were going, because there is no window on a rowing bench, and they never knew why.",
      "\"Then one morning,\" said the old man, \"the drum stopped.\"",
      "A man came down among the benches with a hammer. He was young, younger than most of the rowers, and he was dressed better than anyone they had ever seen, and he knelt down in the filth of the bilge and struck the pin out of the first man's ankle iron himself.",
      "\"Why?\" said Tomas.",
      "\"That is what we asked him,\" said the old man. \"We said, why would you do that? We might run. We might row badly on purpose. We might jump over the side at the first chance.\"",
      "\"What did he say?\"",
      "\"He said: today I need men who are rowing because they have decided to.\"",
      "The old man held out his wrists, which had no irons on them at all.",
      "\"So we decided to,\" he said.",
      "Tomas thought about that for a while, the way you think about something too big to swallow whole.",
      "\"Was it hard?\" he asked.",
      "\"It was the hardest thing any of us ever did,\" said the old man. \"It was much harder than being chained. When you are chained you row because you must, and it is terrible, but it is not yours. When the chain is off, every single pull is yours. Nobody makes you. You have to make you.\"",
      "\"And did you?\"",
      "\"Every one of us,\" said the old man. \"Four hours. Not one man stopped.\"",
      "Tomas walked home in the dark, past the boats with their four oars and their six oars and their eight, and he thought about how easy it would be to stop rowing if nobody was making you.",
      "And ever after, when he counted, he counted a little differently. He was not counting oars any more. He was counting the men who had picked them up.",
      "The end."
    ]
  },

  "riders-with-wings": {
    title: "The Riders With Wings",
    age: 3,
    minutes: "11",
    theme: "Knights",
    virtue: "Courage",
    origin: "Original story, based on Vienna, 1683",
    source: "Mila is invented. The tunnels creeping under the wall, the march over a mountain nobody thought an army could cross, and the winged hussars at the top of it are not.",
    body: [
      "In a city with a wall around it there lived a girl called Mila, and above her house there was a bell.",
      "The bell had one job. If help was ever coming, the bell would ring. That was all. Nobody had ever heard it ring, not her mother, not her grandmother, and Mila was fairly sure it did not work.",
      "Then the digging started.",
      "You could not see the diggers. That was the worst part. They were outside the wall and then, slowly, they were under it, and at night if you lay on the floor with your ear pressed to the stone you could hear them, tock, tock, tock, coming closer under the ground.",
      "Mila lay on the floor every night and listened.",
      "\"Stop that,\" said her mother.",
      "\"Somebody has to know where they are,\" said Mila.",
      "Every day the tock was a little louder, and every day the grown-ups said the word soon. Help was coming soon. Help would be here soon. Soon, soon, soon, until soon began to sound like a word people say when they have nothing else left to say.",
      "One night Mila climbed up to the bell instead, and sat with her back against the cold curve of it, and looked out at the hills.",
      "The hills were black. They were always black at night. She looked at them anyway, because looking was the only job she could think of that she was big enough to do.",
      "And then, very slowly, the hill began to move.",
      "It was not the hill. It was lights, thousands of small lights coming down through the trees on the mountain that everyone had said no army could ever cross, and they came down all night, and by grey morning the whole slope was covered in men and horses and guns hauled on ropes.",
      "Mila rang the bell.",
      "She rang it so hard she came off the floor with every pull, and the whole city woke up, and people ran into the streets in their nightclothes to see.",
      "And that was when they saw the wings.",
      "On the high ground above everything else, drawn up in long silent lines, were horsemen with great arcs of eagle feathers rising off their backs, so that each man looked twice the size of a man. Their lances were longer than a house is wide. They did not move. They waited all day while the fighting went on below them, and the waiting was worse to watch than anything, because everyone knew what the waiting was for.",
      "In the late afternoon the wings came down the hill.",
      "Mila's grandmother, who was very old and had seen a great deal, put her hand over her mouth and said, \"Oh,\" once, and nothing else.",
      "The sound arrived before the riders did: the feathers going through the air, twenty thousand horses hitting the ground at once, a noise like a roof coming off the world. And then it was over, and the tents outside the wall were empty, and the tock under the floor had stopped for good.",
      "Afterwards, when Mila was grown, children would ask her about the wings. Were they magic? Did they fly?",
      "\"No,\" she would say. \"They were only feathers on a frame of wood. A man made them in a workshop.\"",
      "\"Then what were they for?\"",
      "And Mila would say: \"They were for me. So that a girl on a rooftop who had been listening to diggers for two months could look up and see something coming that was bigger than what she was afraid of.\"",
      "Then she would add the true part, which is the part the children never liked as much.",
      "\"Someone had to ride under them,\" she said. \"Feathers do not ride themselves.\"",
      "The end."
    ]
  },

  "wall-that-would-not-move": {
    title: "The Wall That Would Not Move",
    age: 3,
    minutes: "9",
    theme: "Knights",
    virtue: "Obedience",
    origin: "Original story, based on Tours, 732",
    source: "Odo is invented. The Frankish line that stood on a wooded hill for seven days and would not break is not.",
    body: [
      "There was a boy called Odo who wanted, more than anything in the world, to do something.",
      "He had joined the army in spring. He had been given a spear, a shield taller than he was, and a place in the line. And then for six months he had been told to stand.",
      "Stand here. Shoulder against the man on your left. Shield locked against the man on your right. Do not step forward. Do not step back. Stand.",
      "\"When do we fight?\" he asked the old soldier beside him.",
      "\"We are fighting,\" said the old soldier.",
      "\"We are standing.\"",
      "\"Yes,\" said the old soldier. \"Well done.\"",
      "Now they were on a hill in the cold, in the trees, and at the bottom of the hill was an army with horses, and the horses were the finest anyone had ever seen. They shone. Odo had never wanted anything the way he wanted a horse like that.",
      "For seven days the two armies looked at each other and nothing happened.",
      "Odo thought he would go mad. \"Why don't we attack?\"",
      "\"Because down there they have horses and up here we have trees,\" said the old soldier. \"So we wait until they get tired of the trees.\"",
      "\"And what if they never come?\"",
      "\"Then we have won without anyone dying, which is the best kind of winning, and nobody will ever write it down.\"",
      "On the eighth morning they came.",
      "Odo heard them before he saw them, and the sound was not like anything. The ground did it first, a shaking that came up through his boots and into his teeth, and then the horses were through the trees and coming up the slope, and they were enormous, and they were not going to stop.",
      "Everything in Odo said run.",
      "It said it very clearly and very reasonably. It said: you are sixteen, and that is a horse, and a horse weighs more than your whole family, and behind you there is a great deal of empty ground with nobody on it.",
      "He felt the man on his left. He felt the man on his right. Their shoulders were against his, and if he went, the wall had a hole in it, and the hole would be exactly where his friends were standing.",
      "So he stood.",
      "He did not stand bravely. He stood with his eyes mostly shut and a noise coming out of him that he was not proud of afterwards. But his feet did not move, and the shield stayed up, and on either side of him the shoulders stayed where they were.",
      "The horses hit the wall.",
      "And the wall did not move.",
      "They came again. And again. And each time the shields closed back over the gaps like water, and by afternoon the horses would not come up the hill any more, because horses are sensible animals and will not run into a thing that does not give.",
      "That night Odo sat by a fire with his hands shaking so much he could not hold his bread.",
      "\"I didn't do anything,\" he said, ashamed. \"I just stood there.\"",
      "The old soldier looked at him for a long moment.",
      "\"Son,\" he said, \"a wall is not a thing. A wall is a lot of people who all decided not to move at the same time.\"",
      "He handed Odo back his bread.",
      "\"You were the wall,\" he said. \"Now eat.\"",
      "The end."
    ]
  },

  "egg-and-the-dome": {
    title: "The Egg and the Dome",
    age: 3,
    minutes: "9",
    virtue: "Humility",
    origin: "Vasari, 1550",
    source: "Giorgio Vasari put the egg in his Lives of the Artists, a hundred and thirty years after the dome was begun. A near-identical story is told about Columbus, which usually means the story travelled.",
    body: [
      "Once there was a city with a hole in it.",
      "Not a small hole. The city had built itself the most beautiful church anyone had ever seen, with marble the colour of cream and roses, and when they got to the top they discovered a problem.",
      "They had left a space for the roof that was too big for a roof.",
      "So the church stood there with the sky coming in. When it rained, it rained inside. Pigeons lived in it. Children were born, grew up, got married and had children of their own, and the hole was still there, and everyone had stopped noticing it, which is what happens to problems that stay long enough.",
      "The city called for a builder. Builders came from everywhere.",
      "The first said: build a mountain of earth inside the church, right up to the top, lay the roof on the mountain, then dig the mountain out. The city said, and who digs it out? The builder said, put coins in the earth and the people of the city will dig it out for free looking for them. The city thought about this for a while, which tells you how desperate they were.",
      "The second said: build a forest of wooden scaffolding from the floor to the sky. The city asked how much wood. The builder told them. There was not that much wood in the whole country.",
      "And then a small bad-tempered man named Filippo said, \"I can build it with no scaffolding at all.\"",
      "Everyone laughed.",
      "\"Tell us how,\" they said.",
      "\"No,\" said Filippo.",
      "This caused an enormous fuss. They shouted at him. They called him a fraud. Two of them picked him up and carried him out of the room, which had happened to him before.",
      "He came back the next day.",
      "\"If I tell you how,\" he said, \"you will thank me politely and give the work to your cousin.\"",
      "Then he asked for an egg.",
      "Someone fetched one, mostly out of curiosity. Filippo set it on the marble table and said, \"Whoever can stand this egg upright can build the dome.\"",
      "They all tried. Of course they did. They tipped it and steadied it and held their breath and let go, and it rolled over, every time, because that is what eggs do.",
      "When they had all failed, Filippo picked up the egg and cracked it, hard, straight down on the marble, so the bottom went flat.",
      "It stood up.",
      "The room went very quiet, and then very loud. \"Anyone could do that,\" they shouted. \"We could all have done that.\"",
      "\"Yes,\" said Filippo. \"And that is exactly what you will say about the dome, on the day I tell you how.\"",
      "They gave him the work.",
      "It took sixteen years. He laid the bricks in a pattern that held itself up as it went, so that every morning the dome was strong enough to stand on and build a little more, and he never built one single piece of scaffolding. He sent wine and bread up to the workmen so they would not have to climb down at noon, and he watered the wine, because he was not a fool.",
      "And when it was done, the biggest dome in the world stood over the city with no hole in it at all, and people said, well, obviously. You just lay the bricks so they hold themselves up.",
      "Filippo is buried underneath it.",
      "For five hundred years nobody knew quite where, because he never told them that either.",
      "The end."
    ]
  },

  "king-who-burnt-the-bread": {
    title: "The King Who Burnt the Bread",
    age: 1,
    minutes: "8",
    theme: "Castles",
    virtue: "Humility",
    origin: "English legend, about 1000 AD",
    source: "No account written in Alfred's lifetime mentions the cakes. The story first appears in an anonymous Life of St Neot roughly a century after he died, and English children have been told it ever since.",
    body: [
      "Once there was a king with nothing.",
      "He had been a king with a crown and a hall and a great many horses. Then the winter came, and the men with the long ships came with it, and now he had a wet cloak, a marsh full of reeds, and six tired friends.",
      "He knocked on the door of a little house.",
      "A woman opened it. She did not know he was a king. He looked like a wet man.",
      "\"Come in,\" she said, \"but you shall be useful.\"",
      "She was baking. There were loaves on the hot stone by the fire, and she had to go out to the pigs.",
      "\"Watch the bread,\" she said. \"Turn it when it browns. Do not let it burn.\"",
      "\"I will watch the bread,\" said the king.",
      "And he sat down by the fire, and he looked at the bread.",
      "And then he stopped looking at the bread.",
      "Because he was thinking about the hall he had lost, and the friends he had lost, and the hundred difficult things a king thinks about, and while he was thinking the bread went brown, and then dark brown, and then black, and the little house filled up with smoke.",
      "The woman came back.",
      "\"Oh!\" she said. \"You useless man. You will eat my bread quick enough when it is ready, and you cannot even turn it.\"",
      "The king's friends jumped up. They opened their mouths to say: woman, do you know who this is.",
      "The king held up his hand.",
      "\"She is right,\" he said. \"I said I would watch the bread, and I did not watch the bread.\"",
      "And he took the burnt loaves off the stone, and he scraped them, and he ate the black bits himself, and he did not let anyone tell her.",
      "In the spring the king went back out into the world and did a great many large things, and won, and afterwards people would ask him about the winning.",
      "But he liked telling the other story better.",
      "\"I was king of nothing at all,\" he would say, \"and a woman told me off for burning her bread, and she was quite right to.\"",
      "And then he would laugh, and ask for more bread, and turn it himself.",
      "The end."
    ]
  },

  "farmer-who-was-king-for-sixteen-days": {
    title: "The Farmer Who Was King for Sixteen Days",
    age: 1,
    minutes: "8",
    virtue: "Obedience",
    origin: "Livy, about 25 BC",
    source: "Livy tells it in book three of his history of Rome, four centuries after it was supposed to have happened. Washington's officers named a society after Cincinnatus, and the society named a city in Ohio.",
    body: [
      "Once there was a farmer with a small field and an old plough.",
      "He had four acres. He had a wife called Racilia. He had a hut, and a hat, and a great deal of digging to do, and that was the whole of it.",
      "One morning he was in the middle of the field when he saw men coming up the road.",
      "They were important men. You could tell, because they were walking carefully to keep the mud off.",
      "\"Is everything all right?\" the farmer called.",
      "\"No,\" they said. \"Everything is wrong. The army is trapped in a valley and cannot get out.\"",
      "The farmer put down the plough.",
      "\"Racilia,\" he called, \"bring me my good cloak. I cannot hear bad news in my shirt.\"",
      "So she brought it, and he put it on over the mud, and the important men bowed and said:",
      "\"The city has made you its master. Everyone must do what you say. Everyone.\"",
      "\"For how long?\" said the farmer.",
      "\"Six months.\"",
      "\"That is far too long,\" said the farmer. \"Let us go.\"",
      "He walked into the city and called out every man who could carry something, and he told them each to bring food for five days and twelve wooden stakes, and they marched all night in the dark.",
      "And when they got to the valley, the farmer did not shout, and he did not charge.",
      "He said: \"Dig.\"",
      "So they dug, quietly, all the way around the enemy in a great ring, and they put the stakes in the top.",
      "And in the morning the enemy woke up and found that while they had been busy trapping the army, somebody had trapped them.",
      "They gave up before lunch.",
      "The farmer let every single one of them go home. He only made them stoop as they went, under a little doorway of spears, so they would remember to be sorry.",
      "Then he walked back to the city, and everyone cheered, and they gave him a parade, and they offered him a great house and a great deal of gold.",
      "\"No, thank you,\" said the farmer. \"I have a field.\"",
      "And he gave back the power, all of it, on the sixteenth day, with five months still to go.",
      "And he went home, and he picked up the plough, and he finished the row he had started.",
      "The end."
    ]
  },

  "dragon-under-the-hill-1": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "8",
    theme: "Dragons",
    virtue: "Honesty",
    origin: "Original story, in the style of the old dragon tales",
    source: "Invented, and standing in a long queue: Fáfnir on his gold, the barrow-dragon in Beowulf, the Lambton Worm, and every hill in England somebody was told not to dig.",
    night: { n: 1, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "There was a hill at the end of the village, and there was a rule about it.",
      "The rule was: do not dig on the hill.",
      "Nobody could say why. The grandmothers said it, and their grandmothers had said it, and the rule had been handed down so many times that it had worn smooth, like a stone in a river, and lost its reason somewhere along the way.",
      "Wren was eleven, and she kept goats, and she thought the rule was silly.",
      "\"It is only a hill,\" she said.",
      "\"It is only a rule,\" said her grandmother, \"until it isn't.\"",
      "That summer was the dry one. The stream went thin, then went to a trickle, then went to a line of wet stones, and the village dug three wells and found nothing in any of them.",
      "And Wren, sitting on the hill at dusk with her goats, put her hand flat on the ground and felt it.",
      "Warm.",
      "Not sun-warm. The sun had been down an hour. This was a warmth that came up out of the hill, steady, like the side of a sleeping animal.",
      "She put her ear to the grass.",
      "And far down, so far that she thought at first it was her own blood in her own ear, something was breathing.",
      "In. Out. Slow as weather.",
      "Wren sat up. The goats had all stopped eating and were looking at her.",
      "She thought about the wells, and the dry stream, and the fact that a thing which breathes must, sooner or later, drink.",
      "Then she went down the hill and told nobody, which was the second mistake, and got a shovel, which was the first.",
      "Tomorrow night: what Wren found three feet down, and why the hill was warm.",
      "Goodnight."
    ]
  },

  "dragon-under-the-hill-2": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "8",
    theme: "Dragons",
    virtue: "Honesty",
    origin: "Original story, in the style of the old dragon tales",
    source: "Invented, and standing in a long queue: Fáfnir on his gold, the barrow-dragon in Beowulf, the Lambton Worm, and every hill in England somebody was told not to dig.",
    night: { n: 2, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "Wren dug at night, because she was not a fool, only stubborn, and those are different things.",
      "A foot down, ordinary dirt.",
      "Two feet down, warm dirt.",
      "Three feet down, the shovel rang.",
      "She cleared it with her hands. It was not rock. It was a curve of something the colour of an old coin, as wide across as a cartwheel, and when she touched it, it was as warm as a loaf out of the oven, and it moved very slightly under her palm.",
      "In. Out.",
      "A scale. One scale.",
      "Wren sat down in the hole rather suddenly.",
      "And a voice came up through the ground, not loud, and not unkind, and enormously tired.",
      "\"You have woken me,\" it said, \"four hundred years early.\"",
      "Wren could not get any words out.",
      "\"Do not apologise,\" said the voice. \"Apologies take air. I have very little air. Listen.\"",
      "So she listened.",
      "\"I did not come here to sleep,\" the dragon said. \"I came here to be a roof. Under this hill there is water. All the water in this valley, everything your wells are looking for, is held in a cave beneath me, and if I move, the cave falls in, and the water runs away into the deep rock where nobody will ever find it again.\"",
      "\"So you are lying on the water,\" said Wren.",
      "\"I am holding up the ceiling,\" said the dragon. \"For four hundred years. It is not a heroic job. Nobody sings about it. But I am the only one here who is big enough to do it, so I do it.\"",
      "\"Then why did anyone make a rule about digging?\"",
      "The dragon was quiet a moment.",
      "\"Because a scale is a very small door,\" it said. \"And you have just opened one.\"",
      "Wren looked down. Around the edge of the scale she had uncovered, the dry earth was going dark.",
      "Water was coming up. And that was worse than it sounds, because water that is coming up is water that is coming out.",
      "Tomorrow night: what Wren had to carry up the hill, and what the whole village had to do before morning.",
      "Goodnight."
    ]
  },

  "dragon-under-the-hill-3": {
    title: "The Dragon Under the Hill",
    age: 3,
    minutes: "9",
    theme: "Dragons",
    virtue: "Honesty",
    origin: "Original story, in the style of the old dragon tales",
    source: "Invented, and standing in a long queue: Fáfnir on his gold, the barrow-dragon in Beowulf, the Lambton Worm, and every hill in England somebody was told not to dig.",
    night: { n: 3, of: 3 },
    series: "dragon-under-the-hill",
    body: [
      "Wren ran down the hill in the dark and woke the whole village up, and told them the truth, all of it, including the shovel.",
      "They were not pleased.",
      "\"You dug on the hill,\" said the baker.",
      "\"I dug on the hill,\" said Wren.",
      "\"There is a rule about the hill.\"",
      "\"There is now a hole in the hill,\" said Wren, \"and the hole is getting wet, and you can be angry at me tomorrow. Bring clay.\"",
      "And here is the surprising part, and the part Wren remembered all her life: they brought the clay.",
      "Not because they forgave her. They were extremely cross, and several of them said so the entire time. But being cross and being useful turn out to be two jobs a person can do at once, and the village did both, all night, up and down the hill in the dark with buckets.",
      "They packed the clay around the edge of the scale and stamped it down, layer on layer, and the water slowed, and stopped, and the dark patch on the ground dried back to brown.",
      "By dawn the hill was a hill again, with a slightly flatter patch on one side.",
      "Wren stayed until the sun came up, with her ear against the grass.",
      "\"Is it holding?\" she asked.",
      "\"It is holding,\" said the dragon. \"Go to sleep.\"",
      "\"I am sorry,\" said Wren.",
      "\"I know.\"",
      "\"Can I come back?\"",
      "There was a long pause, and the hill breathed in and out.",
      "\"Every rule you were given,\" said the dragon, \"is somebody's grandmother trying to shout at you across four hundred years. They cannot tell you why any more. The why gets lost. All that arrives is the rule.\"",
      "\"That is not very fair,\" said Wren.",
      "\"No,\" agreed the dragon. \"So here is what you will do. You will be the why. You will tell them what is under this hill, and they will not believe you, and you will tell them anyway, and when you are a grandmother you will tell it again.\"",
      "\"And if they still don't believe me?\"",
      "\"Then at least,\" said the dragon, \"they will have a better rule.\"",
      "Wren went down the hill.",
      "She told them. Some of them believed her. Most of them did not.",
      "But that autumn the village dug a new well at the bottom of the slope, well away from the top, exactly where Wren said the water would be, and it came up cold and clean and it never once ran dry.",
      "And the rule changed. It is still the rule there today, and it is a longer rule than it used to be, and children complain about having to learn all of it.",
      "It goes: do not dig on the hill, because something is holding up the water, and it is tired, and it has been doing it since before your great-great-grandmother, and it never once asked for a song.",
      "The end."
    ]
  },

  "forest-that-remembered": {
    title: "The Forest That Remembered",
    age: 1,
    minutes: "8",
    theme: "Forests",
    virtue: "Faithfulness",
    origin: "Original story, in the style of the old forest tales",
    source: "Invented. A forest that watches and keeps accounts is as old as the Grimms, but this one is not theirs.",
    body: [
      "There was a forest that remembered everything.",
      "It remembered the deer that walked through it on Tuesday. It remembered the fox. It remembered a boy who had come in with a red hat forty years ago and gone out again without it.",
      "The forest kept the hat.",
      "One day a small girl came in, and she was lost, and she sat down on a root and cried.",
      "The forest thought about this.",
      "Then it did the only thing a forest can do, which is not very much, but is not nothing.",
      "It dropped an acorn on her head.",
      "\"Ow,\" said the girl.",
      "She looked up. She looked down. And there, by her foot, was the acorn, and beside the acorn was a path she had not noticed, because she had been busy crying, which makes even large things hard to see.",
      "She got up and followed the path.",
      "The path went past a stone the shape of a loaf of bread. It went over a small brown stream with three flat stepping stones. It went under a branch she had to duck for, and she ducked.",
      "And then the trees stopped, and there was the field, and there was the gate, and there was her mother, coming fast.",
      "The girl went home and had her supper and went to bed.",
      "And the forest, being a forest, remembered.",
      "It remembered the stone like a loaf. It remembered the three flat stones in the stream. It remembered the branch you have to duck for.",
      "And it kept them all exactly where they were, for a very long time, in case she ever came back.",
      "She did. She was eighty-one.",
      "She ducked.",
      "Goodnight."
    ]
  },

  "lion-and-the-mouse": {
    title: "The Lion and the Mouse",
    age: 1,
    /* Display-only copy for the receipt card. The numeric `age` above stays the
       filter bucket (1 or 3); this is the editorial line the card prints. */
    ageLabel: "Ages 4\u20136",
    minutes: "2",
    theme: "Forests",
    virtue: "Mercy",
    origin: "Aesop, roughly 600 BC",
    source: "One of the Aesop fables, told in Greek for centuries before anyone wrote the collection down. Caxton printed it in English in 1484, which makes it one of the first stories ever printed in this language.",
    body: [
      "A lion was asleep in the long grass, with his head down on his paws.",
      "A little mouse came along, not looking where she was going, and ran right over his nose.",
      "The lion woke up fast. He put one huge paw on the mouse before she could take a single step.",
      "\"Please,\" said the mouse. \"I didn't mean it. If you let me go, I promise I will help you one day.\"",
      "The lion almost laughed. A mouse, helping a lion? But he was not a cruel lion, and he lifted his paw and let her run home.",
      "Some days later, the lion was walking through that same grass when a hunter's net dropped over him from above.",
      "He pulled. He twisted. He roared until the birds scattered, but the ropes only pulled tighter.",
      "The mouse heard him from far off, and she knew that roar.",
      "She ran all the way back, found the thickest rope, and began to gnaw.",
      "She chewed through one strand, then another, then another, until the net fell open and the lion stepped out of it.",
      "\"You laughed at me once,\" said the mouse.",
      "\"I did,\" said the lion. \"I did not think you could help me. I was wrong.\"",
      "\"Even a small friend,\" said the mouse, \"is worth having.\"",
      "And after that, the lion never again decided who was worth his kindness by their size."
    ]
  },

  "boy-who-went-back": {
    title: "The Boy Who Went Back",
    age: 1,
    ageLabel: "Ages 4–6",
    minutes: "3",
    theme: "The sea",
    virtue: "Forgiveness",
    origin: "Patrick's Confession, 5th century",
    source: "Patrick wrote his own account of the raid, the six years and the walk back. It is one of the very few documents from fifth-century Britain by somebody who was there.",
    body: [
      "There was once a boy who lived in a warm house with a red door, and one morning men came up from the sea in boats and took him away.",
      "They took him a long way over the water, to a green country he had never heard of, and they put him on a hill with a flock of sheep and told him to mind them.",
      "So he minded them.",
      "He minded them in the rain, which there was a great deal of, and in the cold, which was worse. He slept in a hollow out of the wind. He had nobody to talk to at all, except the sheep, who were poor company.",
      "At first he only thought about the red door.",
      "But a year is a long time, and six years is six of them, and somewhere in the middle of all that the boy stopped being a boy. He learned the words the people on that hill used for rain and for sheep and for supper. He learned which of them was kind and which was not. He learned the names of their children.",
      "And then one morning he simply walked away.",
      "He walked for days and days, all the way to the far coast, and he talked his way onto a ship, and the ship took him home — home to the warm house and the red door and everybody shouting and crying at once.",
      "He was safe. That is usually where a story like this one stops.",
      "But this one does not stop there, because years later, when he was grown and free and perfectly comfortable, he started hearing that hill again.",
      "Not the men who took him. The hill.",
      "\"You are not going back,\" said everybody who loved him.",
      "\"I think I am,\" he said.",
      "\"Why? They stole you. They sold you. You were cold for six years.\"",
      "And he said: \"Because there is a boy on that hill right now.\"",
      "Nobody had an answer for that.",
      "So he packed up what he had and he got into a boat and he went back across the water, to the green country, on purpose, carrying something to give away.",
      "He stayed the rest of his life.",
      "And the strangest part is this: he did not go back to get even, and he did not go back because he had forgotten. He remembered every single cold night.",
      "He went back because he knew the way."
    ]
  },
  "three-little-pigs": {
    title: "The Three Little Pigs",
    age: 1,
    minutes: "4",
    virtue: "Perseverance",
    origin: "English folk tale, first printed 1843",
    source: "An English nursery tale, printed by James Halliwell in 1843 and by Joseph Jacobs in 1890. This telling follows Flora Annie Steel's, in which the first two pigs get away. Here the wolf gets away too, and the last line is new.",
    body: [
      "Once upon a time there was an old mother pig who had three little pigs, and not enough food to go round. So when they were old enough, she kissed them each on the snout and sent them out into the world to make their own way.",
      "The first little pig did not like work at all. He found a pile of straw, and he built his house out of that, and it was finished by lunchtime.",
      "The second little pig worked a little harder, but not much. He built his house out of sticks, and it was finished by teatime. Then the two of them sang and danced and played for the rest of the day.",
      "The third little pig worked all day long. He carried bricks, one at a time, and he laid them one on top of the other, and he did not stop until the sun went down. His house had thick walls, a strong door, and a fine fireplace with a big black pot.",
      "The next day a wolf came down the lane. He smelled the first little pig inside the straw house, and his mouth began to water. He knocked on the door.",
      "\"Little pig, little pig, let me in!\"",
      "\"No, no, no! Not by the hair on my chinny chin chin!\"",
      "\"Then I'll huff, and I'll puff, and I'll blow your house down!\"",
      "So he huffed, and he puffed, and he blew the straw house down. But the first little pig was too quick for him, and ran all the way to the house made of sticks.",
      "The wolf followed him. He knocked on the door.",
      "\"Little pigs, little pigs, let me in!\"",
      "\"No, no, no! Not by the hair on our chinny chin chins!\"",
      "\"Then I'll huff, and I'll puff, and I'll blow your house down!\"",
      "So he huffed, and he puffed, and he blew the stick house down. But the two little pigs scrambled away as fast as their little hooves would carry them, all the way to the house made of bricks, and they slammed the door behind them.",
      "The wolf knocked on the door.",
      "\"Little pigs, little pigs, let me in!\"",
      "\"No, no, no! Not by the hair on our chinny chin chins!\"",
      "\"Then I'll huff, and I'll puff, and I'll blow your house down!\"",
      "Well, he huffed, and he puffed. And he puffed, and he huffed. And he huffed and he puffed and he huffed and he puffed, until he had no huff and no puff left in him. And the brick house did not move at all.",
      "So the wolf climbed up onto the roof to come down the chimney.",
      "But the third little pig had heard him. He built up the fire, and he filled the big black pot with water, and just as the wolf came down the chimney, he took off the lid. Splash! In went the wolf.",
      "He shot straight back up the chimney with his tail steaming, and ran off over the hill, and the three little pigs never saw him again.",
      "And the first two little pigs, who had watched their brother lay every brick, went out the very next morning and started building houses of their own. Out of bricks."
    ]
  }
};

/* ----------------------------------------------------------------- cards */
/* Newest last. Two a week. */

/* The seven free stories: the whole of them, to every reader, free or paid.
   The free sign-up promises them, and #seven in the account prints them in
   full with a button to print the lot. They are not tales from TALES on
   purpose — those are the archive the paid plan sells.

   SAMPLE TEXT. Every entry below is a placeholder until the real seven are
   written; replace `title` and `paragraphs` in place and nothing else needs
   to change. One entry per night, Monday first. */
const SEVEN = [
  { title: "Sample story one", paragraphs: [
    "Sample text. The first of the seven free stories goes here, a paragraph at a time.",
    "Every night the little lantern on the garden wall watched the house go dark, one window at a time, and every night it decided it was not tired at all."
  ] },
  { title: "Sample story two", paragraphs: ["Sample text. The second story goes here."] },
  { title: "Sample story three", paragraphs: ["Sample text. The third story goes here."] },
  { title: "Sample story four", paragraphs: ["Sample text. The fourth story goes here."] },
  { title: "Sample story five", paragraphs: ["Sample text. The fifth story goes here."] },
  { title: "Sample story six", paragraphs: ["Sample text. The sixth story goes here."] },
  { title: "Sample story seven", paragraphs: ["Sample text. The seventh story goes here."] }
];

const CARDS = [
  {
    date: "2026-09-03",
    title: "Cincinnatus, Dictator of Rome for Sixteen Days",
    brief: "cincinnatus",
    tale: "farmer-who-was-king-for-sixteen-days",
    question: "If you were in charge of everything for one day, what would you do first, and when would you stop?",
    whyOurs: "Power handed back is worth more than power taken, and we hand ours back at the end of the day too.",
    prayer: "Keep our hands ready for the work in front of us, and light enough to let it go."
  },
  {
    date: "2026-09-07",
    title: "Alfred the Great and the Winter of 878",
    brief: "athelney",
    tale: "king-who-burnt-the-bread",
    question: "Somebody told the king off and he said sorry. When is it hardest for you to say sorry?",
    whyOurs: "The strong man who takes the blame for the burnt bread is the model we were handed, and we have not improved on it.",
    prayer: "For a quiet heart when we are corrected, and a short memory for the correcting."
  },
  {
    date: "2026-09-10",
    title: "Charles Martel at Tours, 732",
    brief: "tours",
    tale: "wall-that-would-not-move",
    question: "Odo wanted to run. What is something you did even though you were scared?",
    whyOurs: "We stand where we are put, shoulder to shoulder, because the gap we leave is always in front of somebody we love.",
    prayer: "Hold us steady tonight, and hold the ones standing beside us."
  },
  {
    date: "2026-09-14",
    title: "Brunelleschi and the Dome of Florence, 1420",
    brief: "dome",
    tale: "egg-and-the-dome",
    question: "What is something that looks easy once somebody has shown you how?",
    whyOurs: "We build things we will not see finished, and we put our names on none of them.",
    prayer: "For the patience to lay one row today, and to leave the top of it to somebody else."
  },
  {
    date: "2026-09-17",
    title: "The Siege of Vienna, 1683",
    brief: "vienna",
    tale: "riders-with-wings",
    question: "Mila's job was to watch. What is a small job you can do that nobody else is doing?",
    whyOurs: "Help came over the mountain for people who had run out of reasons to expect it, and that is the shape of the thing we believe.",
    prayer: "Be the light on the hill for anyone who is listening at the floor tonight."
  },
  {
    date: "2026-09-21",
    title: "The Battle of Hastings, 1066",
    brief: "hastings",
    tale: "lion-and-the-mouse",
    question: "The mouse promised to help a lion, and the lion almost laughed at her. Has anyone ever been surprised that you could help them?",
    whyOurs: "Harold marched the length of England twice in three weeks and still stood in the shield wall himself. We don't get to sit out the fight because we're tired — we show up anyway, and that is most of what courage actually is.",
    prayer: "For steady hands when the ground gives way beneath us, and for the small kindnesses that come back around exactly when we need them."
  },
  {
    date: "2026-09-23",
    title: "Drake Around the World, 1577\u20131580",
    brief: "golden-hind",
    tale: "three-little-pigs",
    question: "The third little pig took the longest to build his house. What is something that was worth taking your time over?",
    whyOurs: "Drake came home because the ship held and every man aboard pulled a rope, gentleman and sailor alike. We lay the bricks while the neighbours are dancing, so there is somewhere to run to when the wolf comes down the lane.",
    prayer: "For the patience to build it properly, and for a door that holds when the wind gets up."
  },
  {
    date: "2026-09-24",
    title: "Patrick in Ireland, the 430s",
    brief: "patrick",
    tale: "boy-who-went-back",
    question: "He went back to the people who took him. Who is someone hard for you to be kind to?",
    whyOurs: "The man walked back into the country that had taken six years off his life, and he walked in with his hands full. That direction — back toward the people who hurt you, carrying something to give — is the whole of what we believe, and it is the hardest thing on the list.",
    prayer: "For a heart that can go back, and for hands that carry something when it does."
  }
];

/* -------------------------------------------------------- today in history */
/* Keyed "MM-DD". 100 to 150 words each. */

/* Keyed "MM-DD", each a list of one or more entries — most dates have one,
   a few (like Sept 21) have more than one true thing worth noting. */
const TODAY = {
  "09-12": [{
    year: "1683",
    text: "The largest cavalry charge in history came down the Vienna Woods in the late afternoon. Vienna had been under siege for two months, and the siege was not being fought at the walls but underneath them, with tunnels packed with gunpowder creeping closer every day. The relief army dragged its guns over forested ridges nobody thought an army could cross. John III Sobieski of Poland put twenty thousand horsemen on the high ground and waited until the infantry had ground its way down the vineyards. Three thousand of them were winged hussars, carrying lances nineteen feet long and wearing frames of eagle feathers on their backs. The Ottoman line did not break so much as come apart. Within three hours Sobieski was standing in the Grand Vizier's tent.",
  }],
  "09-20": [{
    year: "1519",
    text: "Five ships left Sanlúcar de Barrameda in Spain with about 270 men, intending to reach the Spice Islands by sailing west. Ferdinand Magellan was Portuguese, working for the Spanish crown, which made him distrusted by both. The voyage went about as well as that suggests. One ship wrecked, one deserted and sailed home, and Magellan himself was killed in the Philippines in 1521. Three years and one month later, a single ship called the Victoria came back into the same river with eighteen men aboard, so thin the harbour crew did not recognise them. They had gone all the way round. They were also, they discovered on landing, one day out on their calendar, which is how Europe learned the world owes you a day if you chase the sun far enough."
  }],
  "09-21": [
    {
      year: "19 BC",
      text: "Virgil died at Brundisium, coming home from Greece with a fever. He had spent eleven years on the Aeneid and considered it unfinished. About sixty lines in it are still incomplete, breaking off mid-sentence, and you can find them in any edition today. His instruction, given on his deathbed, was that the manuscript should be burned. His friends refused, and the emperor Augustus personally overruled him and ordered it published. So the most influential poem in Latin exists because two people ignored a dying man's last request. Dante made him the guide through hell and purgatory thirteen centuries later, and for most of the Middle Ages people opened him at random to tell fortunes, which he would have hated.",
    },
    {
      year: "1937",
      text: "J.R.R. Tolkien's The Hobbit was published in London, in an edition of about 1,500 copies, with a jacket illustration and a map drawn by Tolkien himself. He had been writing it for years to read to his own children and never intended it for anyone else, until a publisher's ten-year-old son was handed the manuscript to review and came back with a one-page report that ended: children of any age from six to twelve will want to hear it read to them again and again. It sold out by Christmas. The sequel he then spent seventeen years on became The Lord of the Rings."
    }
  ],
  "09-23": [
    {
      year: "1939",
      text: "Sigmund Freud, the founder of modern psychoanalysis, died in London. He was eighty-three, and he had lived there for little more than a year. When Germany took over Austria in 1938, Freud was the most famous Jew in Vienna. The Gestapo came to his flat and took his daughter Anna away for a day of questioning, and friends abroad paid the tax the Nazis charged to let the family leave that June. He had smoked cigars all his adult life and had spent sixteen years with cancer of the jaw, through more than thirty operations. Four of his sisters could not get out, and died in the camps. The couch his patients lay on came with him, and it is still in his house in Hampstead, which is now a museum."
    },
    {
      year: "1862",
      text: "Otto von Bismarck was appointed prime minister of Prussia by William I. The king had nearly abdicated instead. His parliament had refused to pay for the army he wanted, and he had already drafted his letter of abdication when his war minister talked him into sending for Bismarck, a diplomat with a reputation for being impossible. They walked in the palace gardens at Babelsberg, and Bismarck promised to govern without parliament's money if he had to. A week later he told a budget committee that the great questions of the day would be settled not by speeches and majority votes but by iron and blood. Three wars followed in seven years, and in 1871 the king of Prussia was proclaimed emperor of a united Germany in the Hall of Mirrors at Versailles."
    }
  ],
  "09-22": [{
    year: "1776",
    text: "Nathan Hale was hanged in Manhattan as a spy. He was twenty-one, a schoolteacher from Connecticut, and he had volunteered for a job every other officer had declined because he was the only one who did not consider it beneath him. He was extremely bad at it. He went behind British lines in civilian clothes with no training, no contacts, no cover story worth the name, and his own Yale diploma in his pocket. He was caught within a week. The famous line about regretting that he had but one life to lose was reported by a British officer who was there, and is probably a paraphrase of a play by Joseph Addison that every educated man of that generation had read. He said something like it, standing on the ladder, and then they hanged him."
  }],
  "10-07": [{
    year: "1571",
    text: "Two fleets of oared galleys met in the Gulf of Patras and fought for four hours at close quarters, ships grappled together so that men crossed from deck to deck as if the sea had been paved. Around 140,000 men were there, and most of them had not chosen to be: the engines of these ships were rowers, three or four to an oar, usually chained at the ankle. Before the fighting, Don John of Austria had the chains struck off his own rowers and promised them their freedom. When it ended, some twelve thousand Christian galley slaves came off the benches alive and free. A wounded Spanish soldier named Cervantes lost the use of his left hand there and spent the rest of his life proud of it.",
  }],
  "10-10": [{
    year: "732",
    text: "Charles, mayor of the palace of the Franks, spent seven days on a wooded hill near Poitiers refusing to come down, and won the battle largely because of it. His opponents were cavalry, and cavalry needs an enemy line that breaks. Charles had built something nobody else in the West had, a standing army of professional infantry, paid for by confiscating church land, which made him permanently unpopular with the men who wrote the histories. He formed them into a square on high ground among the trees and made them stand. A chronicler wrote that they stood like a wall, like a belt of ice frozen together. The cavalry came up the hill eight days running and could not break it. Charles was called Martel afterwards: the Hammer.",
  }],
  "05-12": [{
    year: "878",
    text: "Alfred of Wessex came out of the Somerset marshes. In January he had lost his kingdom to a surprise attack during the twelve days of Christmas and escaped into a flooded swamp with a handful of men. He spent three months on an island at Athelney, raiding for food, while the rest of England assumed he was dead. In May he sent word through the shire levies to meet him at Egbert's Stone, and men came from Somerset, Wiltshire and Hampshire and, one chronicler says, rejoiced to see him. Two days later he broke the Danish army at Edington. Then he did the strange thing that made him Great: he stood godfather at his enemy's baptism, gave him gifts, and sent him home to rule under a treaty.",
  }],
  "08-07": [{
    year: "1420",
    text: "Work began on the dome of Florence cathedral, fifty-three years after the city approved a design nobody knew how to build. The church had stood with an octagonal hole in its roof, a hundred and forty feet up and open to the weather, for so long that people had stopped noticing. Every known method needed a wooden skeleton to hold the masonry until it set, and there was not enough timber in Tuscany. Filippo Brunelleschi said he could do it without one and refused to explain how, on the grounds that he would be thanked and then dismissed. He was right about that. It took sixteen years and four million bricks, laid in a herringbone pattern that locked each course so the dome held itself up as it rose.",
  }],
  "07-04": [{
    year: "458 BC",
    text: "The traditional date for the Senate delegation that crossed the Tiber to a four-acre farm and found a former consul at the plough. A Roman army was trapped in a valley. The Republic had a trapdoor for emergencies: one man, total authority, expiring automatically after six months. Cincinnatus asked whether everything was all right, sent his wife for his toga so he could hear the news decently dressed, and took the job. He called up every man of military age, ordered each to bring five days of food and twelve stakes, marched through the night, and had his men dig a ring around the enemy while they slept. They surrendered by the next afternoon. He resigned on the sixteenth day, with five months of absolute power unused, and went home.",
  }],
  "12-25": [{
    year: "800",
    text: "Charlemagne was crowned emperor in Rome, which he claimed afterwards had been a complete surprise and that he would not have gone into the church that day if he had known. Nobody has ever quite believed him. His biographer Einhard, who knew him well, reports the line with a straight face and lets the reader decide. He was the grandson of Charles Martel, the man who had stood on the hill at Poitiers, and the family had gone in three generations from palace officials running the government on behalf of do-nothing kings to emperors in their own right. He was about fifty-eight, he could read but reportedly never mastered writing, and he kept wax tablets under his pillow to practise letters when he could not sleep."
  }]
};
