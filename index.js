/*
AUTHOR: Maher LAAROUSSI
VERSION: 1.0
*/

var website = "http://ent.univ-paris13.fr/";
const args = system.args;
var server = require('webserver').create();
var timestamp = new Date().getTime();
var service = null;
var data;

var casper = require("casper").create({

  waitTimeout: 5000,
  stepTimeout: 5000,
  verbose: true,

  pageSettings: {
    webSecurityEnabled: true,
    loadImages:  true
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

  console.log("");
  console.log("[!] Receive a CURL !");

  var username = request.headers.username;
  var password = request.headers.password;

  data = scrapping(username, password);

  run();

  casper.then(function() {
    response.statusCode = 200;
    response.write(JSON.stringify(data));
    response.close();
  });

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

/* =========================================================  */

function scrapping(username, password) {

  var data = {success: false};

  console.log("[*] Username: " + username);
  console.log("[*] Password: " + password);

  if (username != undefined && password != undefined) {

    casper.start(website);

    casper.waitForSelector('form#fm1', function() {

      if (casper.exists('form#fm1')) {
        casper.fill('form#fm1', {
          username: username,
          password:  password
        }, true);
        console.log("[*] Connexion à l'ENT");
      }
      else {
        console.log("[!] Erreur page");
        response.statusCode = 500;
        response.close();
      }

    });

    casper.then(function() {
      console.log("[*] Attente de 5s");
    });

    casper.wait(5000, function() {

      if (casper.exists('.wdg_tbntl_welcome')) {
        casper.capture('screenshots/' + username + '/' + timestamp + '.png');
        console.log("[*] Connexion OK");
      }
      else {
        console.log("[!] Erreur de connexion");
        response.statusCode = 500;
        response.close();
      }

    });

    casper.then(function() {

      data.nom = casper.getElementInfo(".wdg_tbntl_welcome").text.trim().replace('Bienvenue ', '');
      data.postits = casper.getElementInfo("[widgetcounter='mails']").text.trim();
      data.courriels = casper.getElementInfo("[widgetcounter='mails']").text.trim();
      data.informations = casper.getElementInfo("[widgetcounter='nouvelles']").text.trim();
      data.edt_date = casper.getElementInfo("[widget='emploidutemps'] .wdg_et_content b").text.trim();
      data.art = [];
      data.edt = [];

      edt_html = casper.getElementsInfo("[widget='emploidutemps'] .wdg_et_content span");
      art_html = casper.getElementsInfo("[widget='articles'] .wdg_la_new_post .wdg_la_titre_content");

      console.log("Nom: " + data.nom);

      casper.each(edt_html, function (self, ob) {
        data.edt.push(ob.text);
      });

      casper.each(art_html, function (self, ob) {
        data.art.push(ob.text);
      });

      trame();

    });

    casper.then(function() {
      data.success = true;
      return data;
    });


  }
  else {
    console.log("[!] Identifiants invalides");
  }

  return data;

}

function run() {
  casper.run();
}
