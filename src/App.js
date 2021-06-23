import React, { useState, useEffect } from "react";
import "./App.css";
import Post from "./Post.js";
import { db, auth } from "./firebase.js";
import { Button, Input, makeStyles, Modal } from "@material-ui/core";
import ImageUpload from "./ImageUpload";
import ProfileInfo from "./ProfileInfo";
import { Avatar } from "@material-ui/core";
import { pink } from "@material-ui/core/colors";
import ReactLoading from "react-loading";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  pink: {
    color: theme.palette.getContrastText(pink[500]),
    backgroundColor: pink[500],
  },
  paper: {
    position: "absolute",
    width: 200,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "10px",
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignin, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [onMobile, setOnMobile] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const [loadingSpinnerLogin, setLoadingSpinnerLogin] = useState(false);

  useEffect(() => {
    // use to be persistent,i.e. even when site is closed the user is still logged in
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //logged in
        console.log(authUser);
        setUser(authUser);
      } else {
        //logged out
        setUser(null);
      }
    });

    return () => {
      //clean up the previous listener if the useEffect is fired again.
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const handleSignUp = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          // add the username
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));

    setOpen(false);
    setUsername("");
    setPassword("");
    setEmail("");
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoadingSpinnerLogin(true);
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setLoadingSpinnerLogin(false);
    setOpenSignIn(false);
    setUsername("");
    setPassword("");
    setEmail("");
  };

  return (
    <div className="app">
      {loadingSpinnerLogin ? (
        <center>
          <ReactLoading type="spin" color="lightgrey" />
          <h2 className="createPostText">Logging in</h2>
          <p>Please wait...</p>
        </center>
      ) : (
        <>
          <div className="app__header">
            <img
              className="app__headerImage"
              src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-99de8.appspot.com/o/Logo%2FAniMedia1.png?alt=media&token=22bea877-013f-4abe-b05d-1d54c00407e3"
              alt=""
            />
            <div className="app__authContainer">
              {user ? (
                <>
                  <Avatar
                    className={`avatarProfile ${classes.pink}`}
                    onClick={() => {
                      onMobile ? setOnMobile(false) : setOnMobile(true);
                    }}
                  />
                  <ImageUpload
                    username={user.displayName}
                    photoURL={user.photoURL}
                  />
                  <Button
                    style={{
                      backgroundColor: "#E91E63",
                      color: "#FFFFFF",
                      marginLeft: "10px",
                      padding: "9px",
                    }}
                    onClick={() => auth.signOut()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    style={{
                      backgroundColor: "#E91E63",
                      color: "#FFFFFF",
                      marginRight: "10px",
                      padding: "9px",
                    }}
                    onClick={() => setOpenSignIn(true)}
                  >
                    Signin
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#E91E63",
                      color: "#FFFFFF",
                      marginRight: "10px",
                      padding: "9px",
                    }}
                    onClick={() => setOpen(true)}
                  >
                    Signup
                  </Button>
                </>
              )}
            </div>
          </div>

          <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <div style={modalStyle} className={classes.paper}>
              <form className="app__signup">
                {loadingSpinner ? (
                  <center>
                    <ReactLoading type="spin" color="lightgrey" />
                    <h2 className="createPostText">Creating Account</h2>
                    <p>Please wait...</p>
                  </center>
                ) : (
                  <>
                    <center>
                      <img
                        className="app__headerImage"
                        src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-99de8.appspot.com/o/Logo%2FAniMedia1.png?alt=media&token=22bea877-013f-4abe-b05d-1d54c00407e3"
                        alt=""
                      />
                    </center>

                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button type="submit" onClick={handleSignUp}>
                      Sign up
                    </Button>
                  </>
                )}
              </form>
            </div>
          </Modal>
          <Modal
            open={openSignin}
            onClose={() => setOpenSignIn(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <div style={modalStyle} className={classes.paper}>
              <form className="app__signup">
                <center>
                  <img
                    className="app__headerImage"
                    src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-99de8.appspot.com/o/Logo%2FAniMedia1.png?alt=media&token=22bea877-013f-4abe-b05d-1d54c00407e3"
                    alt=""
                  />
                </center>

                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button type="submit" onClick={handleSignIn}>
                  Sign in
                </Button>
              </form>
            </div>
          </Modal>

          <div className="app__contents">
            <div className="mobile__profile">
              {onMobile && user ? <ProfileInfo user={user} /> : <div></div>}
            </div>

            <div className="app__posts">
              {posts.map(({ id, post }) => (
                <Post
                  key={id}
                  postId={id}
                  username={post.username}
                  caption={post.caption}
                  imageURL={post.imageURL}
                  user={user}
                  photoURL={post?.avatarURL}
                />
              ))}
            </div>

            {
              user ? (
                <div className="app__profile">
                  <ProfileInfo user={user} />
                </div>
              ) : (
                <div></div>
              ) //do Nothing
            }
          </div>
        </>
      )}
    </div>
  );
}

export default App;
