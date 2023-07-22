
$(document).ready(function(){
    var config = {
        apiKey: "AIzaSyC3t4RIETrwmLIzTrCGl_BltItY4K6s4Ng",
        authDomain: "classstuffpjae.firebaseapp.com",
        databaseURL: "https://classstuffpjae.firebaseio.com/"
                };
    firebase.initializeApp(config);
//need to revisit trainschedule database...this one is temporary
   
    // database var
    var database = firebase.database();

    // Variables for the onClick event
    var name;
    var destination;
    var firstTrain;
    var frequency = 0;
   
    $("#add-train").on("click", function() {
    event.preventDefault();


// Storing and retreiving new train data
        name = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        firstTrain = $("#first-train").val().trim();
        frequency = $("#frequency").val().trim();
    
// adding to firebase
        database.ref().push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });

        $("form")[0].reset();
    });
//validation works but will not submit to database...scope issue maybe
//$("#form-group").checkValidity();
//using snapsot of db to do calcs
    database.ref().on("child_added", function(childSnapshot) {
        //var nextArr;
        var minAway;
        // Chang year so first train comes before now
        var firstTrainNew = moment(childSnapshot.val().firstTrain, "hh:mm").subtract(1, "years");
        // Difference between the current and firstTrain
        var diffTime = moment().diff(moment(firstTrainNew), "minutes");
        var remainder = diffTime % childSnapshot.val().frequency;
        // Minutes until next train
        var minAway = childSnapshot.val().frequency - remainder;
        // Next train time
        var nextTrain = moment().add(minAway, "minutes");
        nextTrain = moment(nextTrain).format("hh:mm");

        $("#add-row").append("<tr><td>" + childSnapshot.val().name +
                "</td><td>" + childSnapshot.val().destination +
                "</td><td>" + childSnapshot.val().frequency +
                "</td><td>" + nextTrain + 
                "</td><td>" + minAway + "</td></tr>");

            // Handle the errors
        }, function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
    });

    database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
        // Updating html
        $("#train-name").html(snapshot.val().name);
        $("#destination").html(snapshot.val().destination);
        $("#first-train").html(snapshot.val().firstTrain);
        $("#frequency").html(snapshot.val().minAway);
    });
});
    
    