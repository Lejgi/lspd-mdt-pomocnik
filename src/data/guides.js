// Návody a pravidla – podle instrukcí CoP. Eliany Rossi (Discord).
(function () {
  window.MDT = window.MDT || {};
  window.MDT.GUIDES = [
    {
      id: 'report',
      icon: 'file',
      title: 'Hlášení (Report)',
      sub: 'Co musí obsahovat a proč',
      blocks: [
        { t: 'p', v: 'Hlášení sepisuje první hlídka, která se dostaví na místo incidentu. Hlášení není mučení – sami si tím kryjete záda. Při stížnosti supervisor rozhoduje právě podle hlášení.' },
        { t: 'warn', v: 'Popis musí obsahovat VŠE, i když policisty, podezřelé a civilisty propojíte v tabletu. Propojení může selhat a k soudu se dodává popis.' },
        { t: 'steps', title: 'Popis – v tomto pořadí', v: [
          'Jakým způsobem jsme se o incidentu dozvěděli',
          'Kde se to stalo',
          'Kdo tam byl z LSPD – jméno a číslo odznaku (BN), NE volací znak',
          'Koho jsme tam našli – vždy s datem narození',
          'Co jsme tam našli',
          'Co LSPD provedlo za úkony',
          'Postup vyšetřování',
          'Řešení',
          'Na konec „Sepsal/a jméno BN v čas sepsání hlášení“',
        ] },
        { t: 'list', title: 'Tablet', v: [
          'ID hlášení se po uložení vyplní samo',
          'Typ podle incidentu (Vandalismus, Napadení, Vloupání, Krádež, Doprava, Ostatní…)',
          'Sdílet VŽDY se šerify (BCSO), DoJ i SABI – vynechání se může brát jako pokus o utajení informací',
          'Štítky: stav případu (v procesu / uzavřeno / vyřešeno) + heslovité shrnutí (ATM, útěk z vězení…)',
        ] },
        { t: 'warn', v: 'Každý důkaz se nejdřív VYFOTÍ, až potom sebere. Při odtahu auta je také nutná fotografie.' },
      ],
    },
    {
      id: 'warrant',
      icon: 'gavel',
      title: 'Zatykač',
      sub: 'Kdy se vydává a jak ho napsat',
      blocks: [
        { t: 'p', v: 'Zatykač se vydává jen na základě usvědčujících důkazů. Příklad: hlídka si při vyjednávání všimla, že suspect nemá rukavice, po jeho odchodu ohledala místo a našla otisky. Ty se později při evidenci ztotožnily s konkrétní osobou → důvod k vydání zatykače.' },
        { t: 'list', title: 'Formát', v: [
          'Název: Jméno - ID hlášení - čin (např. Rocco Bellini - RPT-3345 - přepadení pumpy)',
          'ID zatykače (WRNT-xxxx) se vytvoří v tabletu',
          'Stav: Aktivní / Vykonaný / Prošlý / Zrušený · Priorita: Nízká – Kritická',
        ] },
        { t: 'warn', v: 'Popis zkráceně a VŽDY s ID hlášení. Hlídka, která osobu potká, nemůže půl hodiny číst spis – musí hned vědět, o co jde, osobu zadržet, převézt do CPZ a celý spis si přečíst až potom.' },
      ],
    },
    {
      id: 'bolo',
      icon: 'target',
      title: 'Pátrání (BOLO)',
      sub: 'Vyhlášení a co dělat při kontaktu',
      blocks: [
        { t: 'p', v: 'BOLO se vyhlašuje kvůli rychlejšímu dopadení suspecta. Zadejte co nejpřesnější popis, ideálně fotografii, a zkráceně důvod – aby se vědělo, s čím u suspecta počítat.' },
        { t: 'list', title: 'Formát', v: [
          'Název: Jméno datum narození - důvod (např. Joakim Eriksson 11.7.2002 - Předvedení osoby k výslechu)',
          'Popis: kdo, proč, čas výskytu, ID případu (RPT-xxxx), koho kontaktovat',
          'Podpis: „Vyhlásil/a jméno, BN: číslo, čas“',
          'Stav: Aktivní / Nalezeno / Uzavřené / Zrušené',
        ] },
        { t: 'warn', v: 'Uteče-li jednou a donutí policisty vyhlásit pátrání, počítejte s tím, že bude utíkat znovu či se bránit zadržení.' },
        { t: 'steps', title: 'Narazil jsem na osobu z BOLO', v: [
          'Okamžitě požádat o asistenci kódem 10-32 (aby nevěděl, že voláte posily)',
          'Pokud kód zná a reaguje – výmluva, že jsou zavedené jiné kódy',
          'Nedat nic najevo, vyčkat na posily',
          'Zadržet, převézt do CPZ, pak číst spis',
        ] },
      ],
    },
    {
      id: 'id',
      icon: 'id',
      title: 'Kontrola totožnosti',
      sub: 'Lustrace a ověření osoby',
      blocks: [
        { t: 'steps', title: 'Postup', v: [
          'Vyzvat k PŘEDLOŽENÍ ID (předložení – ne aby vám ID dával)',
          'Zkontrolovat fotografii – na úřadě se často stane chyba s fotkou, při podezření chtít jiný průkaz',
          'Nemá doklad → chtít jméno, příjmení a DATUM NAROZENÍ (ověří, že nedal jméno, co někde slyšel)',
          'Lustrace v tabletu: řidičské oprávnění, průkazy, trestní minulost, poznámky kolegů',
        ] },
        { t: 'list', title: 'Profil občana – doplnit', v: [
          'Fotografie (bez masky a slunečních brýlí), pokud ji nemá',
          'Zaměstnání – na rozdíl od EMS ho nevidíme, doptat se a uložit',
          'Poznámky: opakovaná agrese, opilost, telefonní číslo…',
          'Biometrie (otisk, DNA) – odebrat všem ve státních složkách',
        ] },
        { t: 'p', v: 'Vyhledávat lze podle jména, příjmení, DNA či otisku. Stačí zadat část, ale při shodě je nutné zkontrolovat zbytek.' },
      ],
    },
    {
      id: 'track',
      icon: 'signal',
      title: 'Sledování',
      sub: 'Telefon a sociální sítě',
      blocks: [
        { t: 'list', title: 'Možnosti', v: [
          'Sledování telefonu – zadat číslo, dispečink obdrží PŘIBLIŽNOU oblast hledání (ne přesnou polohu)',
          'Sledování sociálních sítí – platforma + uživatelské jméno → najde telefonní číslo, které pak lze sledovat',
        ] },
        { t: 'warn', v: 'Šifrovaná data nelze vyhledat okamžitě – musí se logicky dešifrovat, jinak nás to pošle na špatné místo.' },
      ],
    },
    {
      id: 'map',
      icon: 'map',
      title: 'Mapa',
      sub: 'Mřížka San Andreas',
      blocks: [
        { t: 'list', title: 'Vrstvy', v: [
          'Odeslání – poslední dispatche (dohledání lokace zpětně při psaní hlášení)',
          'Staff – poloha dostupných státních složek',
          'Rychlostní vačky – rychlostní radary',
          'Vozidla – vozidla státních složek',
          'Sledovače – GPS',
        ] },
        { t: 'warn', v: 'U dispatchů není uveden čas. Po prospání či bouřce dispatche mizí. Lokaci anonymního dispatche NELZE vyhledat.' },
      ],
    },
    {
      id: 'law',
      icon: 'book',
      title: 'Přestupky v tabletu',
      sub: 'Jak pracovat se zákoníkem',
      blocks: [
        { t: 'p', v: 'Ve vyhledávání stačí část slova z názvu. V poznámkách paragrafu je popis všech odstavců a kritéria, podle kterých zvolit správný odstavec (např. překročení rychlosti).' },
        { t: 'warn', v: 'V tabletu je ZÁKAZ cokoliv upravovat – je to jen nápověda. Pokud paragraf chybí, podívat se do zákona a vypsat ho ručně do terminálu.' },
      ],
    },
  ];
})();
