var db = require('node-localdb');

// Inicializar usuarios
var users = db('users.json');
insertLine(users, {UserToken: 'AAA111', UserRole: 'Admin'});
insertLine(users, {UserToken: 'AAA222', UserRole: 'Admin'});


// Inicializar Votaciones
var votings = db('votings.json');
insertLine(votings, {VotingToken: 'BBB111', CreatorToken: 'AAA111', Title: 'Votación sobre la tortilla de patatas. Con o Sin cebolla', CreationDate: '07/11/2016', MultiOption: false, CloseDate: '20/11/2016'});
insertLine(votings, {VotingToken: 'BBB222', CreatorToken: 'AAA111', Title: 'Votación Clinton-Trump', CreationDate: '07/11/2016', MultiOption: false, CloseDate: '08/11/2016'});


// Inicializar Opciones de Votación
var votingOptions = db('votingOptions.json');
insertLine(votingOptions, {VotingToken: 'BBB111', OptionToken: 'CCC111', Description: 'Con Cebolla'});
insertLine(votingOptions, {VotingToken: 'BBB111', OptionToken: 'CCC222', Description: 'Sin Cebolla'});
insertLine(votingOptions, {VotingToken: 'BBB222', OptionToken: 'CCC111', Description: 'Hillary Clinton'});
insertLine(votingOptions, {VotingToken: 'BBB222', OptionToken: 'CCC222', Description: 'Donald Trump'});


// Inicializar Votos
var votes = db('votes.json');
insertLine(votes, {VotingToken: 'BBB111', VoterToken: 'AAA111', OptionToken: 'CCC111', VoteDate: '08/11/2016'});
insertLine(votes, {VotingToken: 'BBB111', VoterToken: 'AAA222', OptionToken: 'CCC222', VoteDate: '09/11/2016'});
insertLine(votes, {VotingToken: 'BBB222', VoterToken: 'AAA111', OptionToken: 'CCC111', VoteDate: '08/11/2016'});
insertLine(votes, {VotingToken: 'BBB222', VoterToken: 'AAA222', OptionToken: 'CCC222', VoteDate: '09/11/2016'});


// Función de inserción
function insertLine(db, line){
	db.insert(line).then(function(u){
		console.log(u);
	});
}