/*
AUTHOR: Maher LAAROUSSI
VERSION: 1.0
*/

var website = "http://ent.univ-paris13.fr/";
var system = require('system');
const args = system.args;
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

trame();
console.log("[!] Server start ...");

var service = server.listen(2828, function (request, response) {

  console.log("");
  console.log("[!] Receive a CURL !");

  var username = request.headers.username;
  var password = request.headers.password;

  console.log("[*] Username: " + username);
  console.log("[*] Password: " + password);

  if (username != undefined && password != undefined) {

    casper.start(website);

    console.log("");

    casper.waitForSelector('form#fm1', function() {

      if (casper.exists('form#fm1')) {
        casper.fill('form#fm1', {
          username: username,
          password:  password
        }, true);
        console.log("[+] Connexion à l'ENT");
      }
      else {
        console.log("[!] Erreur page");
        response.statusCode = 500;
        response.close();
      }

    });

    casper.then(function() {
      console.log("[+] Attente de 5s");
    });

    casper.wait(5000, function() {

      if (casper.exists('.wdg_tbntl_welcome')) {
        casper.capture('screenshots/' + username + '/' + timestamp + '.png');
        console.log("[+] Connexion OK");
      }
      else {
        console.log("[!] Erreur de connexion");
        response.statusCode = 500;
        response.close();
      }

    });

    casper.then(function() {

      var nom = casper.getElementInfo(".wdg_tbntl_welcome").text.trim().replace('Bienvenue ', '');
      var postits = casper.getElementInfo("[widgetcounter='mails']").text.trim();
      var courriels = casper.getElementInfo("[widgetcounter='mails']").text.trim();
      var informations = casper.getElementInfo("[widgetcounter='nouvelles']").text.trim();
      var edt_date = casper.getElementInfo("[widget='emploidutemps'] .wdg_et_content b").text.trim();

      var edt_html = casper.getElementsInfo("[widget='emploidutemps'] .wdg_et_content span");
      var art_html = casper.getElementsInfo("[widget='articles'] .wdg_la_new_post .wdg_la_titre_content");

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
this
      trame();

    });


    response.statusCode = 200;
    response.write(nom);
    response.close();

    casper.thenClick('[rel="dossieradministratif"]');

    casper.then(function() {

      var dossier_html = casper.getElementsInfo("#dossier_administratif div");

      trame();

      casper.each(dossier_html, function (self, ob) {
          console.log(ob.text);
      });

      trame();

    });

    casper.run(function() {
    });

  }
  else {
    console.log("[!] Identifiants invalides");
    response.statusCode = 500;
    response.close();
  }

});

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
