import React, { useState, useEffect } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase.js";
import firebase from "firebase";
import ReactLoading from "react-loading";
import { Button } from "@material-ui/core";

function Post({ postId, username, caption, imageURL, user, photoURL }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (postId) {
      setLoader(true);
      db.collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
          setLoader(false);
        });
    }
  }, [postId]);

  const postComment = (e) => {
    e.preventDefault();
    db.collection("posts").doc(postId).collection("comments").add({
      username: user?.displayName,
      comment: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setComment("");
  };

  const deletePost = (e) => {
    e.preventDefault();
    db.collection("posts")
      .doc(postId)
      .delete()
      .then(() => {})
      .catch((err) => err.message);
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__avatar"
          alt={username?.toUpperCase()}
          src={photoURL}
        />
        <h3>{username}</h3>
        {user?.displayName === username ? (
          <Button
            style={{
              backgroundColor: "#E91E63",
              color: "#FFFFFF",
              marginLeft: "10px",
            }}
            onClick={deletePost}
          >
            Delete
          </Button>
        ) : (
          <div></div>
        )}
      </div>

      <img className="post__image" src={imageURL} alt="" />

      <h4 className="post__caption">
        <strong>{username}</strong> {caption}
      </h4>
      {loader ? (
        <center>
          <ReactLoading type="spin" color="lightgrey" />
        </center>
      ) : (
        <div className="post__comments">
          {comments &&
            comments.map((cmmnt) => {
              return (
                <p>
                  <strong>{cmmnt.username}</strong> {cmmnt.comment}
                </p>
              );
            })}
        </div>
      )}

      {user && (
        <form className="post__commentBox">
          <input
            className="post__input"
            type="text"
            placeholder="Add a Comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          />
          <button
            disabled={!comment}
            className="post__button"
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
