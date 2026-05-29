-- ============================================================
-- U Festival 2026 — seed data for the existing u_festival DB
-- Run in phpMyAdmin or: mysql -u root u_festival < scripts/setup_db.sql
-- Tables already exist — this only inserts/replaces data.
-- ============================================================

USE u_festival;

-- Create map_facilities table if it doesn't exist
CREATE TABLE IF NOT EXISTS map_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ui_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lang VARCHAR(5) NOT NULL,
    key_path VARCHAR(120) NOT NULL,
    text_value TEXT NOT NULL,
    UNIQUE KEY uq_ui_translations_lang_key (lang, key_path)
);

-- Clear existing data
DELETE FROM ui_translations;
DELETE FROM map_facilities;
DELETE FROM schedule_acts;
DELETE FROM schedule_stages;
DELETE FROM schedule_days;
DELETE FROM map_stages;
DELETE FROM map_settings;
DELETE FROM news_items;
DELETE FROM info_faq;
DELETE FROM info_subsections;
DELETE FROM info_sections;
DELETE FROM artists;

-- artists
INSERT INTO artists (id, name, genre, description_nl, description_en, youtube) VALUES
('armin','Armin van Buuren','Trance','Five-time ''World''s No. 1 DJ'' en trance-icoon. Armin levert euforische, energieke sets die headlined hebben op festivals als Tomorrowland en Ultra.','Five-time ''World''s No. 1 DJ'' and trance icon, Armin delivers euphoric, high-energy sets that have headlined festivals from Tomorrowland to Ultra.','https://www.youtube.com/watch?v=TxvpctgU_s8'),
('martin','Martin Garrix','EDM','Brak door als tiener met ''Animals'' en groeide uit tot een van de grootste namen in de EDM-wereld.','Broke through as a teenager with ''Animals'', Martin Garrix has become one of the biggest names in EDM.','https://www.youtube.com/watch?v=Zv1QV6lrc_Y'),
('kensington','Kensington','Indie Rock','Rotterdams indie rock kwintet bekend om stijgende refreinen en krachtige gitaarriffs.','Rotterdam-born indie rock quintet known for soaring choruses and driving guitar riffs.','https://www.youtube.com/watch?v=IH77eOyV95o'),
('within','Within Temptation','Symphonic Metal','Symfonische metalpioniers o.l.v. Sharon den Adel.','Symphonic metal pioneers fronted by Sharon den Adel.','https://www.youtube.com/watch?v=iQVei5C2N4E'),
('de-staat','De Staat','Experimental Rock','Experimentele rockband uit Nijmegen.','Experimental rock outfit from Nijmegen.','https://www.youtube.com/watch?v=0ttGgIQpAUc'),
('chefspecial','Chef''Special','Funk-pop','Viertal uit Haarlem dat funk, pop, rock en hip-hop mixt.','A four-piece from Haarlem mixing funk, pop, rock and hip-hop.','https://www.youtube.com/watch?v=l3jRIr44lss'),
('navarone','Navarone','Rock','Utrechts hardrockend viertal met riff-gedreven anthems.','Utrecht''s hard-hitting rock four-piece.','https://www.youtube.com/watch?v=EvLpaCSnc4k'),
('dotan','Dotan','Folk-pop','Folk-pop singer-songwriter.','Folk-pop singer-songwriter.','https://www.youtube.com/watch?v=FZEuqzW16Nw'),
('eefje','Eefje de Visser','Indie-pop','Indie-popartiest met atmosferische nummers.','Indie-pop artist crafting atmospheric songs.','https://www.youtube.com/watch?v=6IlLJNmLDMg'),
('froukje','Froukje','Pop','Doorbraak-popzangeres met openhartige teksten.','Breakthrough pop singer combining candid lyrics with catchy hooks.','https://www.youtube.com/watch?v=g4PlReX9e-E'),
('spinvis','Spinvis','Lo-fi pop','Erik de Jong als Spinvis: poëtische, collageachtige nummers.','Erik de Jong performs poetic, collage-like songs.','https://www.youtube.com/watch?v=F3ZTrGWSLf4');

-- map_settings
INSERT INTO map_settings (id, center_lat, center_lng, zoom_level) VALUES (1, 52.0603000, 5.0530000, 16);

-- map_stages
INSERT INTO map_stages (stage_name, lat, lng, color, sort_order) VALUES
('Poton',    52.0606000, 5.0528000, '#F03228', 1),
('The Lake', 52.0601000, 5.0535000, '#247BA0', 2),
('The Club', 52.0598000, 5.0522000, '#E3B505', 3),
('Hanggar',  52.0610000, 5.0540000, '#555555', 4);

-- map_facilities
INSERT INTO map_facilities (type, lat, lng, sort_order) VALUES
('entrance_exit', 52.0617000, 5.0556000, 1),
('bar',           52.0609000, 5.0523000, 2),
('food',          52.0605000, 5.0529000, 3),
('first_aid',     52.0608000, 5.0533000, 4),
('toilet',        52.0608000, 5.0517000, 5),
('locker',        52.0614000, 5.0546000, 6),
('merchandise',   52.0607000, 5.0527000, 7),
('ice_cream',     52.0606000, 5.0531000, 8);

-- schedule_days
INSERT INTO schedule_days (day_key, event_date) VALUES ('saturday','2026-08-15'),('sunday','2026-08-16');

-- schedule_stages
INSERT INTO schedule_stages (day_key, stage_id, stage_name, sort_order) VALUES
('saturday','poton','Poton',1),('saturday','the-lake','The Lake',2),('saturday','the-club','The Club',3),('saturday','hanggar','Hanggar',4),
('sunday',  'poton','Poton',1),('sunday',  'the-lake','The Lake',2),('sunday',  'the-club','The Club',3),('sunday',  'hanggar','Hanggar',4);

-- schedule_acts saturday
INSERT INTO schedule_acts (day_key, stage_id, act_code, artist_id, artist_name, start_time, end_time, genre, sort_order) VALUES
('saturday','poton','armin','armin','Armin van Buuren','10:00','12:00','Trance',1),
('saturday','poton','kensington','kensington','Kensington','12:30','14:00','Indie Rock',2),
('saturday','poton','de-staat','de-staat','De Staat','14:30','16:00','Experimental Rock',3),
('saturday','poton','navarone','navarone','Navarone','16:30','18:00','Rock',4),
('saturday','poton','dotan','dotan','Dotan','18:30','20:00','Folk-pop',5),
('saturday','poton','froukje','froukje','Froukje','20:30','23:45','Pop',6),
('saturday','the-lake','talent-sat-1',NULL,'Talent set 1','10:00','11:15','Talent',1),
('saturday','the-lake','talent-sat-2',NULL,'Talent set 2','11:30','12:45','Talent',2),
('saturday','the-lake','talent-sat-3',NULL,'Talent set 3','13:00','14:15','Talent',3),
('saturday','the-lake','talent-sat-4',NULL,'Talent set 4','14:30','15:45','Talent',4),
('saturday','the-lake','talent-sat-5',NULL,'Talent set 5','16:00','17:15','Talent',5),
('saturday','the-lake','talent-sat-6',NULL,'Talent set 6','17:30','18:45','Talent',6),
('saturday','the-lake','talent-sat-7',NULL,'Talent set 7','19:00','23:45','Talent',7),
('saturday','the-club','comedy-sat',NULL,'Comedy','10:00','11:30','Comedy',1),
('saturday','the-club','lecture-sat',NULL,'Lecture','12:00','13:30','Lecture',2),
('saturday','the-club','theater-sat',NULL,'Theater','14:00','16:00','Theater',3),
('saturday','the-club','movie-sat',NULL,'Movie','16:30','18:30','Film',4),
('saturday','the-club','performance-sat',NULL,'Performance','19:00','21:00','Performance',5),
('saturday','the-club','illusionist-sat',NULL,'Illusionist','21:30','23:45','Illusie',6),
('saturday','hanggar','dj-sat-1',NULL,'DJ set 1','10:00','11:15','DJ',1),
('saturday','hanggar','dj-sat-2',NULL,'DJ set 2','11:30','12:45','DJ',2),
('saturday','hanggar','dj-sat-3',NULL,'DJ set 3','13:00','14:15','DJ',3),
('saturday','hanggar','dj-sat-4',NULL,'DJ set 4','14:30','15:45','DJ',4),
('saturday','hanggar','dj-sat-5',NULL,'DJ set 5','16:00','17:15','DJ',5),
('saturday','hanggar','dj-sat-6',NULL,'DJ set 6','17:30','18:45','DJ',6),
('saturday','hanggar','dj-sat-7',NULL,'DJ set 7','19:00','21:00','DJ',7),
('saturday','hanggar','dj-sat-8',NULL,'DJ set 8','21:30','23:45','DJ',8);

-- schedule_acts sunday
INSERT INTO schedule_acts (day_key, stage_id, act_code, artist_id, artist_name, start_time, end_time, genre, sort_order) VALUES
('sunday','poton','martin','martin','Martin Garrix','10:00','12:00','EDM',1),
('sunday','poton','within','within','Within Temptation','12:30','14:00','Symphonic Metal',2),
('sunday','poton','chefspecial','chefspecial','Chef''Special','14:30','16:00','Funk-pop',3),
('sunday','poton','eefje','eefje','Eefje de Visser','16:30','18:00','Indie-pop',4),
('sunday','poton','spinvis','spinvis','Spinvis','18:30','23:45','Lo-fi pop',5),
('sunday','the-lake','talent-sun-1',NULL,'Talent set 1','10:00','11:15','Talent',1),
('sunday','the-lake','talent-sun-2',NULL,'Talent set 2','11:30','12:45','Talent',2),
('sunday','the-lake','talent-sun-3',NULL,'Talent set 3','13:00','14:15','Talent',3),
('sunday','the-lake','talent-sun-4',NULL,'Talent set 4','14:30','15:45','Talent',4),
('sunday','the-lake','talent-sun-5',NULL,'Talent set 5','16:00','17:15','Talent',5),
('sunday','the-lake','talent-sun-6',NULL,'Talent set 6','17:30','23:45','Talent',6),
('sunday','the-club','comedy-sun',NULL,'Comedy','10:00','11:30','Comedy',1),
('sunday','the-club','lecture-sun',NULL,'Lecture','12:00','13:30','Lecture',2),
('sunday','the-club','theater-sun',NULL,'Theater','14:00','16:00','Theater',3),
('sunday','the-club','movie-sun',NULL,'Movie','16:30','18:30','Film',4),
('sunday','the-club','magic-sun',NULL,'Magic Show','19:00','23:45','Magic',5),
('sunday','hanggar','dj-sun-1',NULL,'DJ set 1','10:00','11:15','DJ',1),
('sunday','hanggar','dj-sun-2',NULL,'DJ set 2','11:30','12:45','DJ',2),
('sunday','hanggar','dj-sun-3',NULL,'DJ set 3','13:00','14:15','DJ',3),
('sunday','hanggar','dj-sun-4',NULL,'DJ set 4','14:30','15:45','DJ',4),
('sunday','hanggar','dj-sun-5',NULL,'DJ set 5','16:00','17:15','DJ',5),
('sunday','hanggar','dj-sun-6',NULL,'DJ set 6','17:30','18:45','DJ',6),
('sunday','hanggar','dj-sun-7',NULL,'DJ set 7','19:00','21:00','DJ',7),
('sunday','hanggar','dj-sun-8',NULL,'DJ set 8','21:30','23:45','DJ',8);

-- news_items
INSERT INTO news_items (id, lang, title, text, published_at) VALUES
(1,'nl','❤️U Festival 2026 is bijna hier!','Over een paar weken openen de poorten van het grootste studentenfestival van Utrecht.','2026-08-01 10:00:00'),
(2,'nl','Line-up compleet: Armin van Buuren & Martin Garrix!','We zijn trots om aan te kondigen dat Armin van Buuren en Martin Garrix de headliners zijn van ❤️U Festival 2026.','2026-08-05 14:30:00'),
(3,'nl','Gratis shuttlebus vanaf Utrecht Centraal','Er rijdt een gratis shuttlebus vanaf Utrecht Centraal (Mineurslaan) naar het festivalterrein. Heen: 12:00-19:00, terug: vanaf 21:00.','2026-08-10 09:00:00'),
(4,'nl','Download de ❤️U Festival App','Mis geen enkel optreden! Met de officiële ❤️U Festival app heb je het complete programma altijd bij de hand.','2026-08-12 16:00:00'),
(1,'en','❤️U Festival 2026 is almost here!','In just a few weeks, the gates of Utrecht''s biggest student festival will open.','2026-08-01 10:00:00'),
(2,'en','Line-up complete: Armin van Buuren & Martin Garrix!','We''re proud to announce that Armin van Buuren and Martin Garrix are headlining ❤️U Festival 2026.','2026-08-05 14:30:00'),
(3,'en','Free shuttle bus from Utrecht Centraal','A free shuttle bus runs from Utrecht Centraal (Mineurslaan) to the festival grounds.','2026-08-10 09:00:00'),
(4,'en','Download the ❤️U Festival App','Don''t miss a single performance! With the official ❤️U Festival app you have the complete schedule at your fingertips.','2026-08-12 16:00:00');

-- info_sections
INSERT INTO info_sections (section_key, lang, title, content, sort_order) VALUES
('general','nl','Algemeen & Contact','Het ❤️U Festival is voor (nieuwe) studenten in de regio Utrecht.',1),
('location','nl','Locatie','Locatie: Grasweide Strijkviertel, Utrecht\nNavigatieadres: Strijkviertelweg, Utrecht',2),
('datetime','nl','Datum & Openingstijden','Zaterdag 5 augustus 2026 — 10:00 tot 23:45 uur\nZondag 6 augustus 2026 — 10:00 tot 23:45 uur',3),
('transport','nl','Bereikbaarheid',NULL,4),
('lockers','nl','Lockers','Op het festivalterrein zijn kluisjes aanwezig. Hier passen 3 a 4 jassen in.',5),
('golden-glu','nl','Golden-GLU','Studenten van het GLU hebben speciale privileges en zijn herkenbaar aan een gouden armbandje.',6),
('emergency','nl','Noodcontacten & Veiligheid','Spoedeisende hulp: bel 112\n\nPolitie (niet-spoed): bel 0900-8844\n\nEHBO op het festival: zichtbaar aangegeven op het terrein.',7),
('faq','nl','FAQ',NULL,8),
('general','en','General & Contact','The ❤️U Festival is for (new) students in the Utrecht region.',1),
('location','en','Location','Location: Grasweide Strijkviertel, Utrecht\nNavigation address: Strijkviertelweg, Utrecht',2),
('datetime','en','Date & Opening Hours','Saturday 5 August 2026 — 10:00 to 23:45\nSunday 6 August 2026 — 10:00 to 23:45',3),
('transport','en','Getting There',NULL,4),
('lockers','en','Lockers','There is a large range of lockers available on the festival grounds.',5),
('golden-glu','en','Golden-GLU','GLU students have special privileges and are recognisable by a golden wristband.',6),
('emergency','en','Emergency Contacts & Safety','Emergency services: call 112\n\nPolice (non-emergency): call 0900-8844\n\nFirst aid: clearly marked on the grounds.',7),
('faq','en','FAQ',NULL,8);

-- info_subsections
INSERT INTO info_subsections (section_key, lang, subsection_title, subsection_content, sort_order) VALUES
('transport','nl','Fiets','Er is een grote gratis fietsenstalling aanwezig.',1),
('transport','nl','Auto','Je kunt een parkingticket aanschaffen op P+R Papendorp.',2),
('transport','nl','OV','Kom je met het openbaar vervoer? Plan dan je trip via 9292.nl.',3),
('transport','nl','Shuttlebus','Vanaf Utrecht Centraal kun je de gratis shuttlebus pakken. Rijdt 12:00-19:00 naar festival, vanaf 21:00 terug.',4),
('transport','nl','Taxi + Kiss & Ride','Navigeer naar Strijkviertel, De Meern (Utrecht).',5),
('transport','en','Bicycle','There is a large free bicycle parking area where you can park your bike all day.',1),
('transport','en','Car','Parking is available at P+R Papendorp, follow the signs P online ticket.',2),
('transport','en','Public Transport','Coming by public transport? Plan your trip via 9292.nl.',3),
('transport','en','Shuttle Bus','From Utrecht Centraal take the free shuttle bus. Runs 12:00-19:00 to festival, from 21:00 back.',4),
('transport','en','Taxi + Kiss & Ride','Navigate to Strijkviertel, De Meern (Utrecht).',5);

-- info_faq
INSERT INTO info_faq (section_key, lang, question, answer, sort_order) VALUES
('faq','nl','Ik gebruik medicatie. Wat nu?','Medicijnen in een dagdosis zijn toegestaan. Een doktersverklaring is noodzakelijk.',1),
('faq','nl','Mag ik het festivalterrein tussentijds verlaten?','Nee, dat is helaas niet mogelijk.',2),
('faq','nl','Zijn er lockers?','Ja! Op het terrein kun je medium en grote lockers huren.',3),
('faq','en','I use medication. What now?','Medication in a daily dose is permitted. A doctor''s statement is required.',1),
('faq','en','Can I leave the festival grounds during the event?','No, unfortunately that is not possible.',2),
('faq','en','Are there lockers?','Yes! You can rent medium and large lockers on the grounds.',3);

-- ui_translations (replaces src/locales/*.json)
INSERT INTO ui_translations (lang, key_path, text_value) VALUES
('nl','nav.home','Home'),
('nl','nav.info','Info'),
('nl','nav.schedule','Programma'),
('nl','nav.map','Kaart'),
('nl','home.welcome','Welkom bij'),
('nl','home.festivalName','U Festival 2026'),
('nl','home.dates','Za 5 & Zo 6 augustus 2026'),
('nl','home.location','Grasweide Strijkviertel, Utrecht'),
('nl','home.liveNow','Festival is nu bezig!'),
('nl','home.notStarted','Het festival begint op 5 augustus 2026'),
('nl','home.ended','Het festival is afgelopen. Tot volgend jaar!'),
('nl','home.news','Nieuws'),
('nl','info.title','Festival Info'),
('nl','schedule.title','Programma'),
('nl','schedule.saturday','Zaterdag'),
('nl','schedule.sunday','Zondag'),
('nl','schedule.favorites','Mijn favorieten'),
('nl','schedule.allActs','Alle acts'),
('nl','schedule.noFavorites','Je hebt nog geen favorieten. Tik op het hartje bij een act om deze toe te voegen.'),
('nl','schedule.stage','Podium'),
('nl','schedule.time','Tijd'),
('nl','schedule.genre','Genre'),
('nl','schedule.close','Sluiten'),
('nl','schedule.notifyOn','Notificaties aan'),
('nl','schedule.notifyOff','Notificaties uit'),
('nl','schedule.addFav','Favoriet toevoegen'),
('nl','schedule.removeFav','Favoriet'),
('nl','schedule.notificationBody','{artist} begint over {minutes} minuten op {stage}!'),
('nl','schedule.notificationTitle','{artist} begint over {minutes} minuten op {stage}!'),
('nl','map.title','Festivalkaart'),
('nl','map.myLocation','Mijn locatie'),
('nl','map.gpsError','GPS is niet beschikbaar. Controleer je locatie-instellingen.'),
('nl','map.gpsDenied','Locatietoegang is geweigerd. Schakel dit in via je browserinstellingen.'),
('nl','common.darkMode','Donkere modus'),
('nl','common.lightMode','Lichte modus'),
('nl','common.language','Taal'),
('en','nav.home','Home'),
('en','nav.info','Info'),
('en','nav.schedule','Schedule'),
('en','nav.map','Map'),
('en','home.welcome','Welcome to'),
('en','home.festivalName','U Festival 2026'),
('en','home.dates','Sat 5 & Sun 6 August 2026'),
('en','home.location','Grasweide Strijkviertel, Utrecht'),
('en','home.liveNow','Festival is live now!'),
('en','home.notStarted','The festival starts on August 15, 2026'),
('en','home.ended','The festival has ended. See you next year!'),
('en','home.news','News'),
('en','info.title','Festival Info'),
('en','schedule.title','Schedule'),
('en','schedule.saturday','Saturday'),
('en','schedule.sunday','Sunday'),
('en','schedule.favorites','My favorites'),
('en','schedule.allActs','All acts'),
('en','schedule.noFavorites','No favorites yet. Tap the heart on an act to add it.'),
('en','schedule.stage','Stage'),
('en','schedule.time','Time'),
('en','schedule.genre','Genre'),
('en','schedule.close','Close'),
('en','schedule.notifyOn','Notifications on'),
('en','schedule.notifyOff','Notifications off'),
('en','schedule.addFav','Add to favorites'),
('en','schedule.removeFav','Favorited'),
('en','schedule.notificationBody','{artist} starts in {minutes} minutes at {stage}!'),
('en','schedule.notificationTitle','{artist} starts in {minutes} minutes at {stage}!'),
('en','map.title','Festival Map'),
('en','map.myLocation','My location'),
('en','map.gpsError','GPS is not available. Check your location settings.'),
('en','map.gpsDenied','Location access was denied. Enable it in your browser settings.'),
('en','common.darkMode','Dark mode'),
('en','common.lightMode','Light mode'),
('en','common.language','Language')
ON DUPLICATE KEY UPDATE text_value = VALUES(text_value);
