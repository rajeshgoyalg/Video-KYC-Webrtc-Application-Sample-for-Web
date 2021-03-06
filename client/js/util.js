///////////////////////////////////////////////////////
//
// File: util.js
// This function tries to get a Token for a Room
//
// Last Updated: 29-11-2018
// Reformat, Indentation, Inline Comments
//
/////////////////////////////////////////////////////
var counter = 0;
var room,roomData;
var localStream = null;
window.onload = function () {


    $("#joinRoom").on("click",function(){
        $("#joinRoom").attr("disabled", "disabled");
        $(".preloader").show();
        createRoom(function (result) {

        });
    });
    $("#close_sample").on("click",function(){
        $("#quest_container").show();
        $("#sample_text_container").hide();
        next_question(counter);
    });
    $("#take_snapshot").on("click",function () {
        $("#snapshot_text").html("Saving  Photo...");
        $("#take_snapshot").attr("disabled", "disabled");
        var filename = roomData.conf_num+"_snapshot.png";
        var data = localStream.getVideoFrameURL(["image/png"]);
        creatSnapShot({
            "data":data,
            "filename": filename
        },function(data){

            if(data.success == true)
            {
                $("#snapshot-container").hide();
                $("#snapshot-container-success-text").show().fadeOut(2000);
                setTimeout(function(){
                    $(".question_container").show().fadeIn(2000);
                },2000)


            }
        });

    })
    $("#next_question").on("click",function(){
        $("#next_question").hide();
        counter++;
        next_question(counter);
    });
    $(".close_quest").on("click",function(){
        room.disconnect();
       $("#confo_container").hide();
       $(".joinRoom").hide();
       $("#thanks_msg").show();
    });

}

var options = {
    player: {
        'height': '100%',
        'width': '100%',
        'minHeight': 'inherit',
        'minWidth': 'inherit'
    },
    resizer:false,
    toolbar: {
        displayMode: false,
        branding: {
            display: false
        }
    }
};
let reconnectInfo={'allow_reconnect':false,'number_of_attempts':3,'timeout_interval':15000};
var config = {
    audio: true,
    video: true,
    data: true,
    videoSize: [320, 180, 640, 480],
    maxVideoLayers: 1,
    attributes : {
        name:name
    }
};
var createRoom = function (callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response =  JSON.parse(this.responseText);
            if(response.error){
                $.toast({
                    heading: 'Error',
                    text: response.error,
                    showHideTransition: 'fade',
                    icon: 'error',
                    position: 'top-right',
                    showHideTransition: 'slide'
                });
            }
            else {
               var  token_json =  {
                    "name": "Q",
                    "role": "participant",
                    "roomId": response.room.room_id,
                    "user_ref": "Q",
                };
               setTimeout(function () {
                   EnxRtc.Logger.setLogLevel(4);

                   createToken(token_json, function (response) {
                       var token = response;
                       // Join Room
                       localStream = EnxRtc.joinRoom(token, config, function (success, error) {
                           if (error && error != null) {

                           }

                           if (success && success != null) {
                               room = success.room;
                                // You need to save room.roomID in the database
                               roomData = success.roomData;
                               // You also need to save roomData.conf_num in the database against room id
                               for (var i = 0; i < success.streams.length; i++) {
                                   room.subscribe(success.streams[i]);
                               }
                               localStream.play("local_video_div",options);
                               $(".joinRoom").hide();
                               $("#joinRoom").removeAttr("disabled")
                               $("#confo_container").show();
                               // next_question(counter);
                               setTimeout(function () {
                                   $('.preloader').fadeOut();
                               }, 500);
                           }
                       },reconnectInfo);
                   })
               },2000);
                callback(true)
            }


        }
    };
    xhttp.open("POST", "/createRoom/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};

var createToken = function (details, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response =  JSON.parse(this.responseText);
            if(response.error){
                $.toast({
                    heading: 'Error',
                    text: response.error,
                    showHideTransition: 'fade',
                    icon: 'error',
                    position: 'top-right',
                    showHideTransition: 'slide'
                });
            }
            else {
                callback(response.token);
            }
        }
    };
    xhttp.open("POST", "/createToken/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};

var creatSnapShot = function (details, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
           callback({"success":true});
        }
    };
    xhttp.open("POST", "/createSnapShot/", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(details));
};

var random_num = parseInt((""+Math.random()).substring(2,7))
var questions = [
    {"question":"What is your name?"},
    {"question":"What is your age?"},
    {"question":"What is your city?"},
    {"question":"What is the number on screen "+random_num},


]

function next_question(counter)
{
    if(counter >= questions.length)
    {
        $("#next_question").hide();
        $("#question").hide();
        $("#close_quest").show();
    }
    else if(counter == questions.length-1){
        $("#question").html(questions[counter].question);
        var jsonData = {
            "type": "public",
            "from": "Remit",
            "message": questions[counter].question,
            "timestamp": moment()._d.getTime()
        }
        localStream.sendData(jsonData);
        $("#next_question").hide();
        setTimeout(function(){
            $("#close_quest").show();
        },10000);


    }
    else
    {
        $("#question").html(questions[counter].question);
        var jsonData = {
            "type": "public",
            "from": "Remit",
            "message": questions[counter].question,
            "timestamp": moment()._d.getTime()
        }
        localStream.sendData(jsonData);
        setTimeout(function(){
            $("#next_question").show();
        },10000);
    }
}