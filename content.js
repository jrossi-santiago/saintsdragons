/* Saints & Dragons — nightly content.
 *
 * Seed content. Every card, brief, tale and date entry below is real history,
 * written to the voice rules, and is meant to be edited or replaced as the
 * real schedule fills in. The shapes are what app.js renders against:
 *
 *   CARDS   one per night, newest last. Points at a brief and a tale.
 *   BRIEFS  the four-minute read for the dad. Keyed by slug.
 *   TALES   the read-aloud. Keyed by slug.
 *   TODAY   one entry per calendar date, keyed "MM-DD".
 *
 * No saints, no explicit religious language anywhere except the "Before lights
 * out" prayer or verse and the one-line "Why this is ours".
 */

const ERAS = ["Greece and Rome", "Knights and lords", "The 1700s", "The 1800s", "1900 to 1950", "And everything else"];
const KINDS = ["A person", "A battle", "A council", "A builder", "A mother", "A heresy", "A feast"];
const THEMES = ["Knights", "Dragons", "Forests", "Courage", "Obedience", "Mercy"];

/* ---------------------------------------------------------------- briefs */

const BRIEFS = {
  "lepanto": {
    title: "The Battle of Lepanto, 1571",
    era: "And everything else",
    kind: "A battle",
    minutes: 4,
    hook: "The last great battle fought with oared galleys. Most of the men who rowed them were slaves, chained to the bench.",
    stillWithUs: "A ship's kitchen is still called the galley.",
    tale: "boy-who-counted-oars",
    body: [
      "On 7 October 1571, two fleets met in the Gulf of Patras, off the west coast of Greece. Between them they had about four hundred ships and roughly a hundred and forty thousand men.",
      "A war galley was not a sailing ship. It was rowed. A hundred and fifty feet long, twenty-five or thirty oars a side, three or four men to an oar. In both fleets most of those rowers were slaves or convicts, chained at the ankle. They could not see out. They rowed to a drum.",
      "The Christian fleet was commanded by Don John of Austria. He was twenty-four, the illegitimate son of an emperor, and he had the job mainly because Venice, Spain and Genoa would not serve under each other. Before the battle he had the chains struck off his own rowers and promised them their freedom. Then he went from ship to ship in a fast boat so the men could see him.",
      "He also had the rams sawn off the front of his galleys. The ram was the traditional weapon, and it pointed the bow guns at the sky. Without it the guns could fire flat, into the waterline of anything coming at them. He put six Venetian galleasses out ahead of his line as well. They were too heavy to row properly, so he had them towed into position.",
      "Ali Pasha brought the Ottoman fleet on in a crescent. It rowed into the galleasses and lost about seventy ships before the two lines met. Then the lines met, and for four hours it stopped being a naval battle. Ships grappled together and men fought on foot across the decks.",
      "It ended in the early afternoon. The Ottoman flagship was boarded and Ali Pasha was killed. About a hundred and twenty galleys were captured intact. Some twelve thousand Christian galley slaves came off the benches free.",
      "It mattered less than the celebrations suggested. The Ottoman navy was rebuilt inside a year. What changed was the assumption that the fleet coming west could not be stopped.",
      "One of the wounded was a twenty-four-year-old Spanish soldier with a fever. He had been told to stay below deck. He went up anyway, took three gunshot wounds, and never used his left hand again. His name was Miguel de Cervantes. Thirty-four years later he wrote Don Quixote, and he stayed proud of the hand."
    ]
  },

  "vienna": {
    title: "The Siege of Vienna, 1683",
    era: "And everything else",
    kind: "A battle",
    minutes: 4,
    hook: "Vienna held out for two months against tunnels dug under its walls. Then twenty thousand horsemen came down the mountain behind the besiegers.",
    stillWithUs: "The story that the croissant was invented at this siege is almost certainly false, and people still tell it.",
    tale: "riders-with-wings",
    body: [
      "In July 1683 Vienna had about fifteen thousand defenders and walls that were good but not new. Outside was an Ottoman army of perhaps a hundred and fifty thousand under the Grand Vizier Kara Mustafa.",
      "He did not storm the walls. He dug. Ottoman siege engineering was the best in the world, and its method was to drive tunnels under the defences, pack the ends with gunpowder, and bring the walls down from underneath. The trenches crept forward for two months. The defenders dug their own tunnels to meet them and fought underground in the dark. By early September the outer works had holes in them and the garrison was down to about four thousand men who could still fight.",
      "Vienna had sent for help in July. A relief force had to be assembled out of the German princes and Poland, and it needed a commander all of them would actually obey. That was John III Sobieski, King of Poland.",
      "Sobieski brought the Polish winged hussars. A hussar carried a lance nineteen feet long, hollowed out to keep the weight down and built to shatter on impact. Behind the lance he had a sabre, a war hammer and two pistols. On his back or his saddle was a wooden frame of eagle feathers. Nobody agrees what the wings were for. The usual answers are the noise they made and the fact that they made horse and rider look much bigger.",
      "On 11 September the relief army came over the Vienna Woods, steep forested ground nobody expected an army with artillery to cross. They hauled the guns over by rope. Kara Mustafa had his army facing the city and had to turn it round.",
      "The fighting took most of 12 September, infantry working down the slope through vineyards. In the late afternoon Sobieski formed up about twenty thousand cavalry on the high ground, three thousand of them hussars, and sent them into the Ottoman flank. It is still the largest cavalry charge ever made. Within three hours Sobieski was standing in Kara Mustafa's tent.",
      "Kara Mustafa got back to Belgrade, where the Sultan had him strangled with a silk cord. That was the customary end for a defeated commander of his rank. The Ottoman empire had been pushing west for three hundred years. From that autumn it went the other way.",
      "Sobieski wrote to his wife the next day. He was fifty-four and had been riding for weeks. The letter is mostly about the tent, the horses, and a parrot that got loose in the confusion."
    ]
  },

  "tours": {
    title: "Charles Martel at Tours, 732",
    era: "Knights and lords",
    kind: "A battle",
    minutes: 4,
    hook: "A Frankish army stood on a wooded hill for seven days and would not come down. The cavalry that came up at them could not break the line.",
    stillWithUs: "His nickname ended up as his grandson's name. Charlemagne is just Charles the Great.",
    tale: "wall-that-would-not-move",
    body: [
      "In October 732, on wooded ground between Tours and Poitiers, a Frankish army stood on a hill for seven days and refused to come down.",
      "The man who put them there was Charles, mayor of the palace. The Frankish kings of that generation did almost nothing. They were carried about in ox carts and produced heirs, and the government was run by an official whose job had started out as household steward. Charles held that job. He was also the most experienced soldier in western Europe, and he had something nobody else in the West had: a standing army of full-time professional infantry.",
      "That cost money he did not have, so he confiscated church lands to pay and equip his men. The chroniclers who praised him for the battle never quite forgave him for the funding.",
      "Coming north was an Umayyad force under Abd al-Rahman al-Ghafiqi, the governor of al-Andalus. It was mostly cavalry and it was very good. Its method had worked for a century: ride at the enemy line, and the line, usually a levy of farmers, breaks. Then ride the men down from behind. Most casualties in a medieval battle happen after one side turns and runs.",
      "Charles built his week around denying that. He marched on back roads and got between the raiders and Tours, so his position was a surprise. He took high wooded ground, where cavalry has to come uphill through trees. He formed his infantry into a dense square and told them to hold. Then he waited seven days while the weather got colder. His men had cloaks. The Umayyad cavalry, raiding up from the south in autumn, did not.",
      "Abd al-Rahman had to attack in the end. A chronicler wrote that the Franks stood like a wall, like a belt of ice frozen together. The cavalry came up the hill and did not break the square.",
      "The battle turned on a rumour. Scouts Charles had sent round the flank got into the Umayyad camp and started freeing prisoners. Word went through the cavalry that the camp was being taken, and a good part of it broke off to ride back and save the plunder. Abd al-Rahman tried to stop them, was surrounded and was killed. By morning the camp was empty. The Franks scouted all day before they believed it.",
      "Charles was called Martel afterwards, the Hammer. Whether the battle saved Europe is argued about, and the honest answer is that it was one of several. The result at home is not in doubt. Charles ended the day as the only real power in Francia. His son Pépin took the crown outright. His grandson was Charlemagne."
    ]
  },

  "dome": {
    title: "Brunelleschi and the Dome of Florence, 1420",
    era: "Knights and lords",
    kind: "A builder",
    minutes: 4,
    hook: "Florence approved a cathedral dome nobody knew how to build, then left a hole in the roof for fifty years waiting for someone to work it out.",
    stillWithUs: "Four million bricks, no steel, six hundred years. It is still the largest masonry dome in the world.",
    tale: "egg-and-the-dome",
    body: [
      "In 1367 Florence approved a design for its cathedral with a dome a hundred and forty-three feet across. Nobody in Europe knew how to build a dome that size. The city approved it anyway, on the assumption that somebody would work it out before they got to the top.",
      "They built the rest of the cathedral and got to the top. By 1418 there was a church in the middle of Florence with an octagonal hole in its roof a hundred and forty feet up, open to the weather, and it had been that way for years.",
      "The problem was not the dome. It was the day before the dome. A masonry arch does not stand until the last stone is in, so every vault in Europe was built on centering: a full wooden skeleton holding the stone until the mortar cured. Centering a dome this size needed more timber than Tuscany had, plus a scaffold rising from the cathedral floor a hundred and forty feet below. Anyone who costed it honestly came back with a number the city would not pay.",
      "The city held a competition in 1418. One entry came from Filippo Brunelleschi, a goldsmith by training, difficult and secretive. He had lost the competition for the baptistery doors twenty years earlier, gone to Rome, and spent years measuring the ruins. He said he could build the dome with no centering at all. He would not say how. His argument was that if he explained the method he would be thanked and then dismissed.",
      "This is where the egg comes in. Vasari tells the story a century later, so it has probably been improved. The judges pressed him, and Brunelleschi proposed instead that whoever could stand an egg upright on a slab of marble should get the commission. Everyone tried and failed. He took the egg, cracked its base flat on the marble, and stood it up. The others said they could have done that. He said they would say the same about the dome.",
      "He got the job, jointly with his old rival Ghiberti, which he resented for the rest of his life. His method was several things at once. Two shells, inner and outer, braced together, so the load came down through ribs instead of as one dead weight. Herringbone brickwork, with bricks set vertically at intervals to lock each course and stop the courses above sliding inward before the mortar set. Rings of sandstone and iron cramps around the base, holding the whole thing in like a barrel hoop. And an ox-driven hoist with a reversible gear, so a team could raise and lower loads without being unhitched and turned around.",
      "It took sixteen years. He kept food and wine up on the platforms so the masons would not spend half a day climbing down and back for lunch, and he watered the wine. Four million bricks went up. The dome was closed in 1436.",
      "He is buried underneath it. Nobody knew exactly where until the grave was found during excavations in 1972."
    ]
  },

  "athelney": {
    title: "Alfred the Great and the Winter of 878",
    era: "Knights and lords",
    kind: "A person",
    minutes: 4,
    hook: "In January he lost his kingdom to a surprise attack at Christmas. In May he came out of a swamp with an army and took it back.",
    stillWithUs: "He had the law and the histories put into English because he thought a country that cannot read its own language stops being one.",
    tale: "king-who-burnt-the-bread",
    body: [
      "The Great Heathen Army landed in England in 865. Within ten years it had ended three of the four English kingdoms. Northumbria, East Anglia and Mercia were gone. By the winter of 877 only Wessex was left, under a young king named Alfred who had been buying time with money for years.",
      "In early January 878 the Danish leader Guthrum broke the truce and attacked Chippenham during the twelve days of Christmas, when nobody campaigned and the king's household was scattered. It worked. Alfred got out into the Somerset Levels with what one chronicle calls a small company.",
      "The Levels in winter were not farmland. They were flooded marsh, reeds and alder, crossed by paths you had to know, with occasional islands of dry ground. Alfred spent about three months on one of them, at Athelney, raiding for supplies.",
      "The burnt cakes belong here. A century later a monk wrote that Alfred sheltered in a swineherd's cottage, and the wife, not knowing who he was, set him to watch loaves baking on the hearth. He let them burn and she told him off. It is almost certainly invented. It has lasted a thousand years because it is the only story about a king that starts with him ruining the dinner.",
      "In May he came out. He sent word through the shire levies, men who farm and are called up, to meet him at Egbert's Stone. Asser says the men of Somerset, Wiltshire and Hampshire came and were glad to see him, because they had thought he was dead. Two days later he broke Guthrum's army at Edington, followed the survivors to Chippenham, and sat outside for fourteen days until they gave in.",
      "Then he did the thing he is actually remembered for. He did not execute Guthrum. He stood godfather at his baptism, kept him at court for twelve days, gave him presents and sent him home to rule East Anglia under a treaty with a drawn border. It was not softness. A Danish king inside the settlement was cheaper and steadier than a dead one and a new one every spring.",
      "He spent the next twenty years on infrastructure. A ring of fortified towns, the burhs, laid out so that no part of Wessex was more than a long day's walk from a wall. The army split in half, so one half was always in the fields and the food supply did not collapse mid-campaign. Ships built longer than the Danish ones. A law code assembled out of the older English codes.",
      "He learned Latin in his thirties and translated books himself, in the evenings. He wrote that when he came to the throne he could not think of one man south of the Thames who could translate a letter. He was ill for most of his adult life with something that caused him serious pain, and he did the translating anyway."
    ]
  },

  "cincinnatus": {
    title: "Cincinnatus, Dictator of Rome for Sixteen Days",
    era: "Greece and Rome",
    kind: "A person",
    minutes: 4,
    hook: "Rome had a legal trapdoor: in an emergency, one man got absolute power for six months. He used sixteen days of it and handed the rest back.",
    stillWithUs: "Cincinnati is named after him, by army officers who thought Washington had done the same thing.",
    tale: "farmer-who-was-king-for-sixteen-days",
    body: [
      "The Roman Republic was built by men who were frightened of kings. They had thrown one out, and the constitution afterwards was an argument about making sure nobody became another. Power was split between two consuls who could each veto the other, and they held office for one year only.",
      "That prevents tyranny well and handles an emergency badly. So the Romans wrote themselves a trapdoor. In a crisis the Senate could name a dictator: one man, no colleague, no veto, total authority over the state and the army. The office lasted six months at most and expired on its own.",
      "In 458 BC they used it. A Roman consular army had got itself trapped in a valley by the Aequi, and five horsemen had ridden out through the enemy line to bring the news. The Senate sent a delegation across the Tiber to a farm of about four acres, worked by a former consul named Lucius Quinctius Cincinnatus.",
      "Livy says they found him at the plough. He asked whether everything was all right, then called to his wife Racilia to fetch his toga from the hut so he could hear the Senate's message properly dressed. They told him he was dictator of Rome.",
      "He went into the city, called up every man of military age, told each of them to bring five days of cooked rations and twelve stakes, and marched that night. He reached the valley in the dark, put his men in a ring outside the enemy, and had them dig. The Aequi had surrounded a Roman army. They woke up surrounded themselves, by a ditch and a palisade built overnight. They surrendered before the end of the day.",
      "He made the defeated pass under a yoke, three spears set in a low doorway you had to stoop to walk through. It was meant to humiliate and not to kill. He took no land and executed nobody.",
      "Then he went back to Rome, held a triumph, resigned the dictatorship, and returned to the farm. The whole thing took about sixteen days. He had five and a half months of absolute power left and no use for it.",
      "Whether the details are true is a fair question. Livy wrote four hundred years later, at the exact moment the Republic was being replaced by an emperor, and the story is very neat. The Romans were telling it hardest when they were losing the thing it described.",
      "In 1783 George Washington won a war, resigned his commission and went home to farm. The officers who had served under him formed a society and named it after Cincinnatus. Some of them later founded a city in Ohio and gave it the same name. George III is supposed to have said that if Washington gave up power he would be the greatest man in the world."
    ]
  },

  "hastings": {
    title: "The Battle of Hastings, 1066",
    era: "Knights and lords",
    kind: "A battle",
    minutes: 4,
    hook: "Two invasions, three weeks and three hundred miles apart. Harold won the first one, and winning it is most of why he lost the second.",
    stillWithUs: "Nearly every English word for meat at the table \u2014 beef, pork, mutton \u2014 comes from the French the Normans brought. The animals in the field kept their old English names: cow, pig, sheep.",
    tale: "lion-and-the-mouse",
    body: [
      "Edward the Confessor died childless on 5 January 1066. Harold Godwinson was crowned the next morning. That was indecent haste and the only sane move available, because the English succession had no mechanism and two other men held claims worth an army. Harald Hardrada of Norway had a treaty argument. William of Normandy had a promise from Edward and, he said, an oath Harold had sworn over a chest of relics.",
      "William then spent the summer unable to sail. His fleet sat at the mouth of the Dives and at Saint-Val\u00e9ry, waiting on a wind that would not come round, several thousand men eating through the supplies. Harold spent that summer with the south-coast levy standing to. The fyrd served a fixed term. On 8 September the term ran out and the food with it, so he sent them home. The wind changed a fortnight later.",
      "Hardrada came first, into Yorkshire. Harold went north nearly two hundred miles in under a week and arrived before anyone expected an army at all. At Stamford Bridge on 25 September he broke the Norwegians so completely that the survivors sailed home in twenty-four ships out of three hundred. Three days later William landed at Pevensey unopposed. The fleet that should have met him had been stood down and the army that should have met him was in Yorkshire.",
      "Harold turned round and marched back. He could have held at London and let William burn Sussex while the northern earls brought up fresh men. He chose speed again, for the third time in a month, and that choice is the part historians still argue about.",
      "On 14 October he put his army across the ridge on the London road and formed a shield wall. Shields overlapping, perhaps eight hundred yards of line, several ranks deep. At the front stood the housecarls: professional soldiers on wages, in mail, carrying the two-handed Danish axe, a weapon you have to leave the wall to swing and which kills a horse when it lands. Behind them the fyrd. The wall\u2019s whole strength is that it does not move, and every man in it knows he is worth a third as much the moment the line opens.",
      "William had brought a machine built to open it. Archers to force the shields up, infantry to close and pin, cavalry through whatever gap the first two made. He ran that cycle from morning to mid-afternoon against a line that held. Then his Breton left broke and ran. Word went through the army that he was dead, and he pushed his helmet back off his face and rode down the line so the men could see him. What saved the day was that English troops came off the ridge after the Bretons and were killed in the open. Norman writers say he then staged the retreat twice more on purpose. That is a hard manoeuvre for disciplined cavalry and near impossible for cavalry that has genuinely just run, so it may be a chronicler turning an accident into generalship. Either way, the wall was thinner each time it closed up.",
      "Harold was killed towards evening. The Bayeux Tapestry shows a figure taking an arrow at the eye, under the words Harold rex interfectus est. The Carmen, written within a few years, says four knights rode him down and cut him apart. That was long dismissed as too brutal to credit, until people noticed it is also too brutal to invent. The arrow may be a nineteenth-century restorer\u2019s stitching over what was first drawn as a spear. It is one of the best-attested deaths in English history and nobody can tell you how it happened.",
      "The conquest took five more years and was harder than the battle. The north rose twice, and the second rising was answered by burning the country between York and Durham. Domesday Book still lists those villages as waste seventeen years later. That same survey, taken in 1086, counts about a hundred and ninety major tenants holding England from the king. Perhaps two of them were English.",
      "The Bayeux Tapestry is not a tapestry. It is wool embroidery on linen, seventy metres of it, and the needlework is English. It was almost certainly made in Canterbury within twenty years of the battle, by the workshops of the losing side, for a Norman who wanted the story told."
    ]
  }
};

/* ----------------------------------------------------------------- tales */

const TALES = {
  "boy-who-counted-oars": {
    title: "The Boy Who Counted Oars",
    age: 3,
    minutes: "10",
    theme: "Courage",
    origin: "New tale",
    brief: "lepanto",
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
    origin: "New tale",
    brief: "vienna",
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
    theme: "Obedience",
    origin: "New tale",
    brief: "tours",
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
    theme: "Courage",
    origin: "Retold",
    brief: "dome",
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
    theme: "Mercy",
    origin: "Retold",
    brief: "athelney",
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
    theme: "Obedience",
    origin: "Retold",
    brief: "cincinnatus",
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
    origin: "New tale",
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
    origin: "New tale",
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
    origin: "New tale",
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
    origin: "New tale",
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
    theme: "Mercy",
    origin: "Retold",
    brief: "hastings",
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
  }
};

/* ----------------------------------------------------------------- cards */
/* Newest last. Two a week. */

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
    brief: "vienna",
    tale: "riders-with-wings"
  }],
  "09-20": [{
    year: "1519",
    text: "Five ships left Sanlúcar de Barrameda in Spain with about 270 men, intending to reach the Spice Islands by sailing west. Ferdinand Magellan was Portuguese, working for the Spanish crown, which made him distrusted by both. The voyage went about as well as that suggests. One ship wrecked, one deserted and sailed home, and Magellan himself was killed in the Philippines in 1521. Three years and one month later, a single ship called the Victoria came back into the same river with eighteen men aboard, so thin the harbour crew did not recognise them. They had gone all the way round. They were also, they discovered on landing, one day out on their calendar, which is how Europe learned the world owes you a day if you chase the sun far enough."
  }],
  "09-21": [
    {
      year: "19 BC",
      text: "Virgil died at Brundisium, coming home from Greece with a fever. He had spent eleven years on the Aeneid and considered it unfinished. About sixty lines in it are still incomplete, breaking off mid-sentence, and you can find them in any edition today. His instruction, given on his deathbed, was that the manuscript should be burned. His friends refused, and the emperor Augustus personally overruled him and ordered it published. So the most influential poem in Latin exists because two people ignored a dying man's last request. Dante made him the guide through hell and purgatory thirteen centuries later, and for most of the Middle Ages people opened him at random to tell fortunes, which he would have hated.",
      tale: null
    },
    {
      year: "1937",
      text: "J.R.R. Tolkien's The Hobbit was published in London, in an edition of about 1,500 copies, with a jacket illustration and a map drawn by Tolkien himself. He had been writing it for years to read to his own children and never intended it for anyone else, until a publisher's ten-year-old son was handed the manuscript to review and came back with a one-page report that ended: children of any age from six to twelve will want to hear it read to them again and again. It sold out by Christmas. The sequel he then spent seventeen years on became The Lord of the Rings."
    }
  ],
  "09-22": [{
    year: "1776",
    text: "Nathan Hale was hanged in Manhattan as a spy. He was twenty-one, a schoolteacher from Connecticut, and he had volunteered for a job every other officer had declined because he was the only one who did not consider it beneath him. He was extremely bad at it. He went behind British lines in civilian clothes with no training, no contacts, no cover story worth the name, and his own Yale diploma in his pocket. He was caught within a week. The famous line about regretting that he had but one life to lose was reported by a British officer who was there, and is probably a paraphrase of a play by Joseph Addison that every educated man of that generation had read. He said something like it, standing on the ladder, and then they hanged him."
  }],
  "10-07": [{
    year: "1571",
    text: "Two fleets of oared galleys met in the Gulf of Patras and fought for four hours at close quarters, ships grappled together so that men crossed from deck to deck as if the sea had been paved. Around 140,000 men were there, and most of them had not chosen to be: the engines of these ships were rowers, three or four to an oar, usually chained at the ankle. Before the fighting, Don John of Austria had the chains struck off his own rowers and promised them their freedom. When it ended, some twelve thousand Christian galley slaves came off the benches alive and free. A wounded Spanish soldier named Cervantes lost the use of his left hand there and spent the rest of his life proud of it.",
    brief: "lepanto",
    tale: "boy-who-counted-oars"
  }],
  "10-10": [{
    year: "732",
    text: "Charles, mayor of the palace of the Franks, spent seven days on a wooded hill near Poitiers refusing to come down, and won the battle largely because of it. His opponents were cavalry, and cavalry needs an enemy line that breaks. Charles had built something nobody else in the West had, a standing army of professional infantry, paid for by confiscating church land, which made him permanently unpopular with the men who wrote the histories. He formed them into a square on high ground among the trees and made them stand. A chronicler wrote that they stood like a wall, like a belt of ice frozen together. The cavalry came up the hill eight days running and could not break it. Charles was called Martel afterwards: the Hammer.",
    brief: "tours",
    tale: "wall-that-would-not-move"
  }],
  "05-12": [{
    year: "878",
    text: "Alfred of Wessex came out of the Somerset marshes. In January he had lost his kingdom to a surprise attack during the twelve days of Christmas and escaped into a flooded swamp with a handful of men. He spent three months on an island at Athelney, raiding for food, while the rest of England assumed he was dead. In May he sent word through the shire levies to meet him at Egbert's Stone, and men came from Somerset, Wiltshire and Hampshire and, one chronicler says, rejoiced to see him. Two days later he broke the Danish army at Edington. Then he did the strange thing that made him Great: he stood godfather at his enemy's baptism, gave him gifts, and sent him home to rule under a treaty.",
    brief: "athelney",
    tale: "king-who-burnt-the-bread"
  }],
  "08-07": [{
    year: "1420",
    text: "Work began on the dome of Florence cathedral, fifty-three years after the city approved a design nobody knew how to build. The church had stood with an octagonal hole in its roof, a hundred and forty feet up and open to the weather, for so long that people had stopped noticing. Every known method needed a wooden skeleton to hold the masonry until it set, and there was not enough timber in Tuscany. Filippo Brunelleschi said he could do it without one and refused to explain how, on the grounds that he would be thanked and then dismissed. He was right about that. It took sixteen years and four million bricks, laid in a herringbone pattern that locked each course so the dome held itself up as it rose.",
    brief: "dome",
    tale: "egg-and-the-dome"
  }],
  "07-04": [{
    year: "458 BC",
    text: "The traditional date for the Senate delegation that crossed the Tiber to a four-acre farm and found a former consul at the plough. A Roman army was trapped in a valley. The Republic had a trapdoor for emergencies: one man, total authority, expiring automatically after six months. Cincinnatus asked whether everything was all right, sent his wife for his toga so he could hear the news decently dressed, and took the job. He called up every man of military age, ordered each to bring five days of food and twelve stakes, marched through the night, and had his men dig a ring around the enemy while they slept. They surrendered by the next afternoon. He resigned on the sixteenth day, with five months of absolute power unused, and went home.",
    brief: "cincinnatus",
    tale: "farmer-who-was-king-for-sixteen-days"
  }],
  "12-25": [{
    year: "800",
    text: "Charlemagne was crowned emperor in Rome, which he claimed afterwards had been a complete surprise and that he would not have gone into the church that day if he had known. Nobody has ever quite believed him. His biographer Einhard, who knew him well, reports the line with a straight face and lets the reader decide. He was the grandson of Charles Martel, the man who had stood on the hill at Poitiers, and the family had gone in three generations from palace officials running the government on behalf of do-nothing kings to emperors in their own right. He was about fifty-eight, he could read but reportedly never mastered writing, and he kept wax tablets under his pillow to practise letters when he could not sleep."
  }]
};
