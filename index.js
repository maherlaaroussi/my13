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

  var data;

  console.log("");
  console.log("[!] Receive a CURL !");

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

function scrapping(user, pass) {

  var d = {success: false};

  console.log("[*] Username: " + user);
  console.log("[*] Password: " + pass);

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

        casper.capture('screenshots/' + user + '/' + timestamp + '.png');
        console.log("[*] Connexion OK");

        casper.then(function() {

          d.nom = casper.getElementInfo(".wdg_tbntl_welcome").text.trim().replace('Bienvenue ', '');
          d.postits = casper.getElementInfo("[widgetcounter='mails']").text.trim();
          d.courriels = casper.getElementInfo("[widgetcounter='mails']").text.trim();
          d.informations = casper.getElementInfo("[widgetcounter='nouvelles']").text.trim();
          d.edt_date = casper.getElementInfo("[widget='emploidutemps'] .wdg_et_content b").text.trim();
          d.art = [];
          d.edt = [];

          edt_html = casper.getElementsInfo("[widget='emploidutemps'] .wdg_et_content span");
          art_html = casper.getElementsInfo("[widget='articles'] .wdg_la_new_post .wdg_la_titre_content");

          console.log("[!] Nom: " + d.nom);

          casper.each(edt_html, function (self, ob) {
            d.edt.push(ob.text);
          });

          casper.each(art_html, function (self, ob) {
            d.art.push(ob.text);
          });

          console.log("");

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
      return d;
    });


  }
  else {
    console.log("[!] Identifiants invalides");
  }

  return d;

}

function run() {
  casper.run();
}
