import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {router} from './routes'


Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
      token: "",
      apiKey: "AIzaSyAAGkgcn6EJDqWy8r2l60YxghUklXsfg8A",
      userName: "",
      isGoogleUser: false,
      userID:"",
      expiresIn:"",
      googleUser:null,
      favorites: false,
      willRead:false,
      alreadyRead:false,
      bookKeyForDeletion: "",
    },
    getters : {
        getUserName(state){
            return state.userName;
        },
        getIsGoogleUser(state){
            return state.isGoogleUser;
        },
        getUserID(state){
            return state.userID;
        },
        isAuthenticated(state){
            return state.token !==""
        },
        getToken(state){
            return state.token;
        },
        getExpiresIn(state){
            return state.expiresIn;
        },
        getFavorites(state){
            return state.favorites;
        },

    },
    mutations: {
      setToken(state, token){
          state.token = token
      },
      clearToken(state){
          state.token = ""
      },
      setUserName(state, name){
          state.userName = name;
      },
      clearUserName(state){
          state.userName = "";
      },
      setGoogleUser(state, value){
          state.isGoogleUser = value;
      },
      setUserID(state, userID){
        state.userID = userID;
      },
      setExpiresIn(state, expiresIn){
        state.expiresIn = expiresIn;
      },
      setFavorites(state, value){
          state.favorites = value;
      },
      setWillRead(state, value){
        state.willRead = value;
    },
    setAlreadyRead(state, value){
        state.alreadyRead = value;
    },
      setBookKeyForDeletion(state, key){
          state.bookKeyForDeletion = key;
      },
      clearBookKey(state){
          state.bookKeyForDeletion = '';
      }
      
    },
    actions : {
        initAuth({commit, dispatch}){
            console.log("init auth beginning")
            let token=localStorage.getItem("token")
            if(token){
                let expirationDate = localStorage.getItem("expirationDate");
                let time = new Date().getTime();

                if(time >= +expirationDate){
                    console.log("token suresi doldu");
                    dispatch("logout");

                }else{
                    
                    commit("setToken", token)
                    let timerSecond = +expirationDate - time
                    console.log("timerSecond : " + timerSecond);
                    dispatch("setTimeoutTimer",timerSecond)
                    router.push("/");
                }
                
            }else{
                router.replace('/login').catch(error => {
                    console.info(error);
                  });
                
                 return false
                }
        
        },
        async login({commit, dispatch, state}, authData){
                let authLink = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=";

                if(authData.isUser)
                    authLink = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";

           
                await axios.post(authLink+"AIzaSyAAGkgcn6EJDqWy8r2l60YxghUklXsfg8A",
                        {email: authData.email, password: authData.password,returnSecureToken : true}).
                        then(response =>{
                            localStorage.setItem("userID",response.data.localId);
                            //commit('setUserID', response.data.localId);
                            commit('setToken', response.data.idToken);
                            commit('setExpiresIn', +response.data.expiresIn*1000);
                            dispatch("setTimeoutTimer",state.expiresIn);
                            localStorage.setItem("token",state.token);
                            localStorage.setItem("expirationDate", new Date().getTime() + state.expiresIn)
                            router.replace("/").catch(error=>{
                                console.log("push error " +error);
                            })
                })

           
            
        },
        logout({commit, dispatch, state}){
            console.log("logouttt");
            if(state.isGoogleUser){
                var GoogleAuth = gapi.auth2.getAuthInstance();

                GoogleAuth.signOut().then(()=>{
                    console.log('User signed out.');
                    commit('clearUserName');
                    commit("setGoogleUser", false);
                    commit("clearToken")
                    localStorage.removeItem("token");
                    localStorage.removeItem("expirationDate");
                    localStorage.removeItem("userID");
                    router.push('/login').catch(error=>{
                        console.log("logout error " +error);
                    })
                })
            }
            else{
                commit("clearToken")
                localStorage.removeItem("token");
                localStorage.removeItem("expirationDate");
                localStorage.removeItem("userID");
                router.push('/login').catch(error=>{
                    console.log("logout error " +error);
                })
            }
          
            
        },

        setTimeoutTimer({dispatch}, expiresIn){
            setTimeout(()=>{
                console.log("expires : "+expiresIn)
                dispatch("logout");
            },expiresIn)
        },

        async getDB({commit, dispatch, state}, id){
            await axios({
                method: 'get',
                //url: 'https://vue-book-finder.firebaseio.com/books.json?auth=' + state.token + '&orderBy="bookID"&equalTo="' + bookData.id+ '"',
                url: 'https://vue-book-finder.firebaseio.com/books.json?orderBy="bookID"&equalTo="' + id+ '"&orderBy="userID"&equalTo="' + localStorage.getItem("userID"),
               
              }).then((response) =>{
                console.log("checkIfBookExist");
                console.log(response);
                console.log(response.data);
                if(Object.keys(response.data).length){
                    console.log("response.data dolu")
                    console.log("response.data.key")
                    let booksKey="";
                    for(let key in response.data){
                        console.log("key : " + key);
                        booksKey=key;
                    }
                    commit("setBookKeyForDeletion",booksKey);

                    commit("setFavorites", response.data[booksKey].favorite);
                    commit("setWillRead", response.data[booksKey].willRead);
                    commit("setAlreadyRead", response.data[booksKey].alreadyRead);

                }else{
                    commit("setFavorites", false);
                    commit("setWillRead", false);
                    commit("setAlreadyRead", false);
                }
              });
        },
        async addToDB({commit, dispatch, state}, bookData){
            console.log("user id : "+localStorage.getItem("userID"));
            await axios({
                method: 'post',
                url: 'https://vue-book-finder.firebaseio.com/books.json',
                data: {
                    userID : localStorage.getItem("userID"),
                    bookID : bookData.id,
                    bookTitle : bookData.title,
                    authors : bookData.authors,
                    imageLink : bookData.thumbnail,
                    favorite : bookData.favorite,
                    willRead : bookData.willRead,
                    alreadyRead : bookData.alreadyRead,
                }
              })
              .then((response) =>{
                console.log("successfully sent to firebase");
                console.log(response);
                
              });
        },

        async updateDB({commit, dispatch, state}, bookData){
            
            console.log("update db");
            console.log("user id : "+state.userID);
            console.log(bookData);
            await axios({
                method: 'patch',
                url: 'https://vue-book-finder.firebaseio.com/books/'+state.bookKeyForDeletion+'.json',
                data: {
                    favorite : bookData.favorite,
                    willRead : bookData.willRead,
                    alreadyRead : bookData.alreadyRead,
                }
              })
              .then((response) =>{
                console.log("successfully sent to firebase");
                console.log(response);
                
              });
        },

        async removeFromDB({commit, dispatch, state},key){
            await axios({
                method: 'delete',
                url: 'https://vue-book-finder.firebaseio.com/books/'+(key ? key :state.bookKeyForDeletion)+'.json',
                
              }).then((response) =>{
                console.log("successfully deleted from firebase");
                console.log(response);
                commit("clearBookKey");
                commit("setFavorites",false);
                commit("setWillRead", false);
                commit("setAlreadyRead", false);
              });
        },
        
    },
   
  })

  export default store