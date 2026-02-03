this is a manual file to tell the backend what should do according to the subject reqs or the frontend developper decision :

1. the room ID should have the following strict validation:
	1. length == 6
	2. only capital letters and digits (at least one for each one)

2. the player name should have the following strict validation:
	1. length 3-20
	2. only letters and digits (no spaces or special chars are accepted)
	3. should have at least one letter and one digit.

3. add a LEAVE event for the players who want to leave during a game (in the current flow, i must fully 	disconnect from the socket server! it works but its note the best solution)

