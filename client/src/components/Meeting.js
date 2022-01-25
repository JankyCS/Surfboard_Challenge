import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useParams, useLocation } from "react-router-dom";
import { Container,Row, Col, Button, Form, Modal } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

let endPoint = "http://localhost:5000";
let socket = io.connect(`${endPoint}`);

const Meeting = (props) => {
  const loc = useLocation()
  const admin = loc.state!=null && loc.state.admin ? true : false
  const [topics, setTopics] = useState(["General"])
  const [curTopic, setCurTopic] = useState(topics[0])
  const [message, setMessage] = useState("")
  const [name, setName] = useState("Anonymous")

  const [showNewTopic,setShowNewTopic] = useState(false)
  const [newTopicName,setNewTopicName] = useState("")
  const [newTopicTime,setNewTopicTime] = useState("")
  const [newTopicDesc,setNewTopicDesc] = useState("")

  const {roomid} = useParams()
  const [messages, setMessages] = useState([]);

  const [editingTopic,setEditingTopic] = useState(false)
  const [topicText,setTopicText] = useState("")

  const parseMessage = (msg) => {
      const words = msg.split(" ")
      var messageObject = {
        meetingId: words[0],
        topic: words[1],
        from: words[2],
        text: words.slice(3).join(" ")
      }

      return messageObject
  }

   useEffect(() => {
    const getPastMessages = async () => {
        const pastMessages = await fetch('http://localhost:5000')
        const data = await pastMessages.json()
        let pog = [parseMessage(roomid+" General Welcome-Bot Welcome to General!")].concat(data["messages"].map(msg => parseMessage(msg)).filter(msg=>msg.meetingId === roomid))

        setMessages(pog)

        const topicSet = new Set()
        let allTopics = []
        pog.forEach(message => {
          if(!topicSet.has(message.topic.toLowerCase())){
            allTopics = [...allTopics,message.topic]
            topicSet.add(message.topic.toLowerCase())
          }
        });
        console.log(allTopics)
        setTopics(allTopics)
    }
    getPastMessages()

    socket.on("message", msg => {
      getPastMessages()
      // const messageObject = parseMessage(msg)
      // if(messageObject.meetingId !== roomid){
      //   return
      // }
      // setMessages(prevMessages=>[...prevMessages, messageObject]);
    });
  },[roomid]);

  // On Change
  const onChange = e => {
    setMessage(e.target.value);
  };

  // On Click
  const onClick = () => {
    if (message.replace(" ","") !== "" && name.replace(" ","")!="") {
      const m = roomid.toString()+" "+curTopic+" "+name.replace(" ","-")+" "+message
      setMessages(prev => [...prev,parseMessage(m)])
      socket.emit("message",m);
      setMessage("");
    }
  };



  const createNewTopic = () => {
    if(newTopicName.replace(" ","") !== ""){
      // topics.forEach(topic => {
      //   if(topic.title.toLowerCase() === newTopicName.toLowerCase()){
      //     return
      //   }
      // });
      for(let i =0;i<topics.length;i++){
        const topic = topics[i]
        if(topic.toLowerCase() === newTopicName.toLowerCase()){
          return
        }
      }


      setShowNewTopic(false)

      setTopics(prevTopics => [...prevTopics,newTopicName.replace(" ","-")])
     
      let firstMessage = `Topic: ${newTopicName}`
      firstMessage += newTopicTime !== ""?`\nEstimated Time: ${newTopicTime}`:``
      firstMessage += newTopicDesc !== ""?`\nDescription: ${newTopicDesc}`:``
      
      socket.emit("message", roomid.toString()+" "+newTopicName.replace(" ","-")+" TOPIC-INFORMATION "+firstMessage);

      setNewTopicName("")
      setNewTopicTime("")
      setNewTopicDesc("")
    }
  }

  const editTopic = () => {

  }

  let topicMessages= messages.filter(msg=>msg.topic === curTopic)

  return (
    <div>
      <Modal show={showNewTopic} onHide={()=> setShowNewTopic(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Topic</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
        <Form.Group className="mb-3">
            <Form.Control style={{marginBottom:"10px"}} placeholder="Topic Name"
            value={newTopicName} onChange={e=>setNewTopicName(e.target.value)}/>
            <Form.Control  style={{marginBottom:"10px"}} placeholder="Time Estimate" 
            value={newTopicTime} onChange={e=>setNewTopicTime(e.target.value)}/>
            <Form.Control as="textarea" style={{resize:"none"}}placeholder="Description" rows={5} 
            value={newTopicDesc} onChange={e=>setNewTopicDesc(e.target.value)}
            />
        </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={()=> createNewTopic()}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <Container fluid>
        <Row style={{height:"100vh", maxHeight:"100vh"}}>
          <Col sm={2} style ={{paddingTop:"50px",padding:"50px 0px 10px 0px",backgroundColor:"#f0f0f0",boxShadow: "3px 0px 9px grey"}}>
            <h5 style={{padding:"5px"}}>
              Topics
              {admin?<Button variant="outline-secondary" size="md"style={{float:"right",padding:"0px 6px", borderRadius:"100px"}}
              onClick ={()=>setShowNewTopic(true)}
              >+</Button>:(<div></div>)}
            </h5>

            {
              topics.map(topic=>(
                <div>
                  <p style={{padding:"5px",backgroundColor:curTopic === topic ?"#b5b5b5":"#f0f0f0"}}
                  
                  onClick={()=>{
                    setCurTopic(topic)
                    setEditingTopic(false)
                  }}
                  ># {topic}
                  
                  {topic !== "General" && admin? <p style={{float:"right",padding:"0px 6px", borderRadius:"100px"}}
                    onClick={async ()=>{
                      await fetch('http://localhost:5000/'+roomid+"/"+topic)
                      setTopics(prev=>prev.filter(t=>t!==topic))
                      setCurTopic("General")
                      socket.emit("message", "-");
                    }}
                  >🗑</p>:<div></div>}
                  </p>
                  
                </div>
              ))
            }
          <Form.Control style={{margin:"10px", position: "fixed",bottom: 0,display:"inline",width:"15%"}} value={name} placeholder="Name" onChange={e=>{
            setName(e.target.value)
          }}
            />
          </Col>
          <Col sm={10} style={{
            display: "inline-block",
            alignSelf: "flex-end",
            flexFlow:"wrap",
            whiteSpace:"pre-line",
            overflowWrap: "break-word",
            padding:"20px 20px 1px 20px",
            overflowY:"scroll",
            height:"100%",
            borderBottom: "60px solid rgb(0, 0, 0, 0.1)"
          }}> 
          {
              topicMessages.length>0?
              
              (
              <div>
              <b><p style={{width:"100%",height:"auto", margin:"3px"}}>{topicMessages[0].from}</p></b>
                {
                  !editingTopic || curTopic==="General" || !admin?
                  <p style={{width:"100%",height:"auto", whiteSpace:"pre-line"}}
                    onClick={()=>{
                      setEditingTopic(true)
                      setTopicText(topicMessages[0].text)
                    }}
                  >{topicMessages[0].text}
                  </p>:
                  <span><Form.Control as="textarea" style={{width:"80%", whiteSpace:"pre-line"}}rows={4} 
                  value={topicText} onChange={(e)=>{
                      setTopicText(e.target.value)
                  }}

                  />
                  <Button variant="dark" style={{marginTop:"20px",minWidth:"100px",width:"10%"}} onClick={
                    async ()=>{
                      console.log("TOPIC TEXT IS")
                      console.log(topicText)
                      topicMessages[0].text = topicText
                      await fetch('http://localhost:5000/updateTopic/'+roomid+"/"+curTopic+"/"+encodeURI(topicText))
                      socket.emit("message", "-");
                      setEditingTopic(false)
                    }
                  }>
                        Save
                  </Button>
                  </span>



                }
              </div>
              )
              :
              <div></div>
            
            }
            {
              topicMessages.slice(1).map(msg=>(
                <div style={{display:"block"}}>
                <b><p style={{width:"100%",height:"auto", margin:"3px"}}>{msg.from}</p></b>
                <p style={{width:"100%",height:"auto"}}>{msg.text}</p>
                </div>
              ))
            }
            <div style={{
              display:"inline",
              position:"fixed",
              left:"20vw",
              right : 0,
              bottom: "7px",
            }}>
            <span style={{
              // boxShadow: "0px 0px 50px 10px black"
            }}>
            <Form.Control style={{display:"inline",width:"90%"}} value={message} onChange={e=>onChange(e)}
            
            onKeyDown={(e)=> {
              if(e.key==='Enter'){
                onClick()
              }
            }}
            />
            <Button variant="dark" style={{display:"inline",width:"5%",marginBottom:"4px"}} onClick={()=>onClick()}>
                	▷
            </Button>
            </span>
            </div>
          </Col>
        </Row>
    </Container>
    </div>
  );
};

export default Meeting;