/*
AUTHOR: Maher LAAROUSSI
VERSION: 1.0
*/

var website = "http://ent.univ-paris13.fr/";
var server = require('webserver').create();
var timestamp = new Date().getTime();
var service = null;
var d = {};

var casper = require("casper").create({

  waitTimeout: 5000,
  stepTimeout: 5000,
  verbose: true,

  pageSettings: {
    webSecurityEnabled: true,
    loadImages:  true,
    userAgent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:34.0) Gecko/20100101 Firefox/34.0"
  },
  onWaitTimeout: function() {
    console.log('[*] Waiting ...');
  },
  onStepTimeout: function() {
    console.log('[*] Waiting ...');
  },
  onRunComplete: function() {
  }

});

/* =========================================================  */

trame();
console.log("[!] Server start ...");

service = server.listen(2828, function (request, response) {

  var data;
  var date = new Date();
  var minutes = date.getMinutes();
  var hours = date.getHours();
  var seconds = date.getSeconds();

  console.log("");
  console.log("[" + hours + ":" + minutes + "] Receive a CURL !");

  var username = request.headers.username;
  var password = request.headers.password;

  data = scrapping(username, password);

  run();

  casper.then(function() {

    if (data.success) {
      response.statusCode = 200;
    }
    else {
      response.statusCode = 500;
    }

    phantom.clearCookies();

    response.write(JSON.stringify(data));
    response.close();

  });

});

/* =========================================================  */

casper.on("remote.message", function(msg) {
    console.log("[Remote] " + msg);
});

casper.on("page.error", function(msg, trace) {
    console.log("[Page Error] " + msg);
});

/* =========================================================  */

function log(text) {
	casper.echo(text);
}

function trame() {
  console.log("");
  console.log("========================================================");
  console.log("");
}

/* =========================================================  */

function scrapping(user, pass) {

  var d = {success: false};

  console.log("[*] Username: " + user);

  if (user != undefined && pass != undefined) {

    casper.start(website);

    casper.waitForSelector('form#fm1', function() {

      if (casper.exists('form#fm1')) {
        casper.fill('form#fm1', {
          username: user,
          password:  pass
        }, true);
        console.log("[*] Connexion à l'ENT");
      }
      else {
        console.log("[!] Erreur page");
      }

    });

    casper.wait(5000, function() {

      if (casper.exists('.wdg_tbntl_welcome')) {

        console.log("[*] Connexion OK");

        // casper.capture('screenshots/' + timestamp + '.png');

        casper.then(function() {

          d.nom = casper.getElementInfo(".wdg_tbntl_welcome").text.trim().replace('Bienvenue ', '');
          d.postits = casper.getElementInfo("[widgetcounter='mails']").text.trim();
          d.courriels = casper.getElementInfo("[widgetcounter='mails']").text.trim();
          d.informations = casper.getElementInfo("[widgetcounter='nouvelles']").text.trim();
          //d.edt_date = casper.getElementInfo("[widget='emploidutemps'] .wdg_et_content b").text.trim();
          d.art = [];
          d.edt = [];

          d.prenom = d.nom.split(' ')[1];
          d.nom = d.nom.split(' ')[0];


          //edt_html = casper.getElementsInfo("[widget='emploidutemps'] .wdg_et_content span");
          art_html = casper.getElementsInfo("[widget='articles'] .wdg_la_new_post .wdg_la_titre_content");

          console.log("[!] Nom: " + d.prenom + " " + d.nom.toUpperCase());

          /*
          casper.each(edt_html, function (self, ob) {
            d.edt.push(ob.text);
          });
          */

          casper.each(art_html, function (self, ob) {
            d.art.push(ob.text);
          });

          /* ALL STUFFS */
          d.dossier = dossier();

          casper.then(function() {
            d.success = true;
          });

        });

      }
      else {
        console.log("[!] Erreur de connexion");
        casper.then(function() {
          d.success = false;
        });
      }

    });

    casper.then(function() {
      console.log("");
      return d;
    });


  }
  else {
    console.log("[!] Identifiants invalides");
  }

  return d;

}

function dossier() {

  var dossier = {};
  var photo = {};

  casper.open('https://ent.univ-paris13.fr/ajax?__class=APOGEE&__function=RenderFiche');

  casper.waitForSelector("#dossier_administratif");

  casper.then(function() {

    dossier_html = casper.getElementsInfo("#dossier_administratif div.float_right_column");
    var admin = [];

    casper.each(dossier_html, function (self, ob) {
      admin.push(ob.text);
    });

    /* Tri */
    dossier.numero = admin[0];
    dossier.ine = admin[1];
    dossier.birthday = admin[3];
    dossier.cp = admin[5];
    dossier.adresse = admin[4];
    dossier.ville = admin[6];
    dossier.pays = admin[7];
    dossier.phone = admin[8];
    dossier.bac = admin[9];
    dossier.bacannee = admin[10];
    dossier.inscription = admin[11];
    dossier.formation = admin[12];

    var exp = new RegExp(/(\(.*\))/g );
    dossier.code = String(dossier.formation.match(exp));
    dossier.code = dossier.code.substr(1);
    dossier.code = dossier.code.substr(0, (dossier.code.length - 1));

    console.log("[!] FORMATION: " + dossier.code);
    console.log("[!] INE: " + dossier.ine);
    console.log("[!] BIRTHDAY: " + dossier.birthday);

    casper.wait(500);

    // Photo
    casper.thenOpen('https://ent.univ-paris13.fr/ajax?__class=WidgetAvatar&__function=render&__args=user');
    casper.waitForSelector("#cp-originale", function() {

      // photo.originale = casper.getElementById("cp-originale");
      // console.log("URL: " + photo.originale);

      casper.evaluate(function () {
        console.log(document.querySelector('#cp-originale').src);
      });

    });

  });

  return dossier;

}

function show_source() {
  casper.evaluate(function () {
    console.log("[HTML] " + document.documentElement.innerHTML);
    return document;
  });
}

function run() {
  casper.run();
}
