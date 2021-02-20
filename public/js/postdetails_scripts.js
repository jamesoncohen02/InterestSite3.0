let dashedTitle = document.getElementsByTagName("h2")[0].innerText.replace(/ /g, "-");
console.log("title: " + dashedTitle);

document.getElementById("like_button").addEventListener('click', function(){
  let xmlhttp = new XMLHttpRequest();

  //Specify details of the POST request
  xmlhttp.open("POST", "/blog/like/"+dashedTitle, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  //Define the data you'd like to send to the server
  let postData = {
    "like": 1
  };

  //Make a POST request with your data in the body of the request
  xmlhttp.send(JSON.stringify(postData));

  //Do something once the Response (Good or Bad) has been received
  xmlhttp.onreadystatechange = function(data) {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let postObject = JSON.parse(xmlhttp.responseText);
      document.getElementById("like_count").innerText = postObject.likes;
    } else{

    }
  }
});

let commentLikeButtons = document.getElementsByClassName("like_comment_button");
let length = commentLikeButtons.length;
insertEvent(length);

function insertEvent(x){
for (let i = 0; i<x; i++){
  commentLikeButtons[i].addEventListener('click', function(){
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/blog/commentLike/"+dashedTitle, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    let postData = {
      "like": 1,
      "currIndex": i
    }
    xmlhttp.send(JSON.stringify(postData));
    xmlhttp.onreadystatechange = function(data) {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        let postObject = JSON.parse(xmlhttp.responseText);
        console.log(i);
        document.getElementById("like_count_"+i).innerText = postObject.comments[i].likes;
      } else{
      }
    }
  });
}
}

document.getElementById("comment_submit").addEventListener('click', function(){
  let xmlhttp = new XMLHttpRequest();
  //Specify details of the POST request
  xmlhttp.open("POST", "/blog/comment/"+dashedTitle, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  let commAuthor = document.getElementById("author_dropdown").value;
  let commContent = document.getElementById("CommentContent_textarea").value;
  let d = new Date();
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let month = months[d.getMonth()];
  let date = d.getDate().toString();
  let year = d.getFullYear().toString();
  let fullDate = month+" " + date + ", " + year;
  let hour = d.getHours();
  let am = true;
  if (hour>12){
    hour = hour-12;
    am = false;;
  }
  if (hour == 0){hour=12; am = true;}
  let min = d.getMinutes();
  if (min<10){
    min = "0" + min;
  }
  let ampmText = "";
  if (am){ampmText = "am";} else{ampmText = "pm";}
  let fullTime = hour + ":" + min + ampmText;

  let postData = {
    "Date": fullDate,
    Time: fullTime,
    Author: commAuthor,
    Content: commContent
  }

  if (commAuthor!==""){
  xmlhttp.send(JSON.stringify(postData));
  document.getElementById("CommentContent_textarea").value = "";
  let options = document.getElementsByTagName("option");
  for (let i = 0; i<options.length; i++){
    if(options[i].hasAttribute('selected')) options[i].removeAttribute('selected');
    options[0].setAttribute('selected', "selected");
  }
  let author = commAuthor;
  let dateText = fullDate;
  let timeText = fullTime;
  let contentTx = commContent;

  length++;

  let likeCommentButtons = document.getElementsByClassName("like_comment_button");

  document.getElementById("no_comments_yet").innerText = "";
  let newCommentDiv = document.createElement("div");
  newCommentDiv.classList.add("comment_official");
  if(likeCommentButtons.length!==0){
    newCommentDiv.appendChild(document.createElement("hr"));
  }

  let authorDateEl = document.createElement("h7");
  authorDateEl.setAttribute("style", "font-style: italic;")
  let authorDateText = document.createTextNode(author + ", " + dateText + ", " + timeText);
  authorDateEl.appendChild(authorDateText);
  newCommentDiv.appendChild(authorDateEl);
  newCommentDiv.appendChild(document.createElement("br"));

  let contentEl = document.createElement("p");
  let contentText = document.createTextNode(contentTx);
  contentEl.appendChild(contentText);
  contentEl.setAttribute("style", "margin-left:10px; margin-top:10px;")
  newCommentDiv.appendChild(contentEl);

  let likeSpan = document.createElement("span");
  let likeButton = document.createElement("button");
  likeButton.innerText = "Like";
  likeButton.setAttribute("type", "button");
  likeButton.className += "btn btn-outline-primary btn-sm like_comment_button";
  likeSpan.appendChild(likeButton);
  let likeImg = document.createElement("img");
  likeImg.setAttribute("src", "/images/like.png");
  likeImg.setAttribute("height", "30px");
  likeImg.setAttribute("width", "30px");
  likeImg.setAttribute("style", "margin-left:5px; margin-right:3px;")
  likeSpan.appendChild(likeImg);
  let likeHead = document.createElement("h7");
  likeHead.id = "like_count_" + (length-1);
  likeSpan.appendChild(likeHead);
  newCommentDiv.appendChild(likeSpan);
  newCommentDiv.appendChild(document.createElement("br"));

  document.getElementById("all_comments").appendChild(newCommentDiv);

  insertEvent(length);

} else if (postData.Content==""){
  alert("Your comment is currently blank.");
} else {
  alert("You must select an author for the comment.");
}

  xmlhttp.onreadystatechange = function(data) {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      let postObject = JSON.parse(xmlhttp.responseText);
    } else{
    }
  }
});
