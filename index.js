/* AUTHOR: Maher LAAROUSSI */

var website = "http://ent.univ-paris13.fr/";

var system = require('system');
var server = require('webserver').create();

var timestamp = new Date().getTime();

var casper = require("casper").create({

  waitTimeout: 10000,
  stepTimeout: 10000,
  verbose: true,

  pageSettings: {
    webSecurityEnabled: true,
    loadImages:  true
  },
  onWaitTimeout: function() {
        log('[-] Waiting ...');
  },
  onStepTimeout: function() {
      log('[-] Waiting ...');
  }

});

/* =========================================================  */

var username = casper.cli.get(0);
var password = casper.cli.get(1);

if (username != undefined && password != undefined) {

  casper.start(website);

  casper.waitForSelector('#username');

  console.log("");

  casper.then(function() {

    if (this.exists('form#fm1')) {
      this.fill('form#fm1', {
        username: username,
        password:  password
      }, true);
      console.log("[+] Connexion à l'ENT");

    }

  });

  casper.then(function() {
    console.log("[+] Attente de 5s");
  });

  casper.wait(5000, function() {

    if (this.exists('.wdg_tbntl_welcome')) {
      this.capture('screenshots/' + username + '/' + timestamp + '.png');
      console.log("[+] Connexion OK");
    }
    else {
      console.log("[!] Erreur de connexion");
      console.log("");
      casper.exit();
    }

  });

  casper.then(function() {

    var nom = this.getElementInfo(".wdg_tbntl_welcome").text.trim().replace('Bienvenue ', '');
    var postits = this.getElementInfo("[widgetcounter='mails']").text.trim();
    var courriels = this.getElementInfo("[widgetcounter='mails']").text.trim();
    var informations = this.getElementInfo("[widgetcounter='nouvelles']").text.trim();
    var edt_date = this.getElementInfo("[widget='emploidutemps'] .wdg_et_content b").text.trim();

    var edt_html = this.getElementsInfo("[widget='emploidutemps'] .wdg_et_content span");
    var art_html = this.getElementsInfo("[widget='articles'] .wdg_la_new_post .wdg_la_titre_content");

    trame();

    console.log("Nom: " + nom);
    console.log("Post-It: " + postits);
    console.log("Courriels: " + courriels);
    console.log("Informations: " + informations);

    console.log("");

    console.log("Date: " + edt_date);

    casper.each(edt_html, function (self, ob) {
        console.log(ob.text);
    });

    console.log("");

    console.log("Articles:");

    casper.each(art_html, function (self, ob) {
        console.log("[?] " + ob.text);
    });

    trame();

  });

  casper.thenClick('[rel="dossieradministratif"]');

  casper.then(function() {

    var dossier_html = this.getElementsInfo("#dossier_administratif div");

    trame();

    casper.each(dossier_html, function (self, ob) {
        console.log(ob.text);
    });

    trame();

    this.exit();

  });

  casper.run(function() {
  });

}
else {
  console.log("[!] Identifiants invalides");
  casper.exit();
}

/* =========================================================  */

casper.on('remote.message', function(msg) {
    this.echo('Remote message: ' + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("Page Error: " + msg, "ERROR");
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
