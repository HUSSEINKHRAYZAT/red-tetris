this is a manual file to tell the backend what should do according to the subject reqs or the frontend developper decision :

1. the room ID should have the following strict validation:
	1. length == 6
	2. only capital letters and digits (at least one for each one)

2. the player name should have the following strict validation:
	1. length 3-20
	2. only letters and digits (no spaces or special chars are accepted)
	3. should have at least one letter and one digit.

3. add a LEAVE event for the players who want to leave during a game (in the current flow, i must fully 	disconnect from the socket server! it works but its note the best solution)

// Errors that i implemented, but need approve from you:

1. need to give access to localhost:1573 (cors). For now , i give access to all the origins [origin: '*'], but i will not push my version of backend!

2. the event that send the lobby to the client when he enter a room, i send a {name : string , isHost: boolean}, this will make some problems because in the frontend , the hosting is taking by the name which can be duplicated. For now ,i send also the ID with them , BUT I NEED YOUR ACCEPT FOR IT!

3. when i play alone, the backend saw that im the winner directly without any real playing, i guess its a problem realted to one-man room, i fix it using AI from the first simple prompt, which provide that the problems isnt complex.

4. i make the backend run on the LAN_IP.

5. the general penalties flow is correct, but their is a critical problems such as 4 n - 1 penalty....
