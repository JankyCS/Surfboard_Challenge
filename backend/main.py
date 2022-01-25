from flask import Flask, jsonify
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketIo = SocketIO(app, cors_allowed_origins="*",ping_interval=5000)
app.debug = True

app.host = 'localhost'

allMessages = []

@socketIo.on("message")
def handleMessage(msg):
    send(msg, broadcast = True)
    if msg !="-":
        allMessages.append(msg)
    return None

@app.route('/', methods=['GET'])
def pastMessages():
    response = jsonify({"messages":allMessages})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/<roomid>/<topicname>', methods=['GET'])
def deleteTopic(roomid,topicname):
    print(roomid,topicname)
    global allMessages
    temp = []
    for a in allMessages:
        k = a.split()
        if k[0]!=roomid or k[1]!=topicname:
            temp.append(a)
    allMessages = temp
    response = jsonify({"success":True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/updateTopic/<roomid>/<topicname>/<newText>', methods=['GET'])
def updateTopic(roomid,topicname,newText):
    global allMessages
    temp = []
    print(newText)
    done = False
    for a in allMessages:
        k = a.split()
        if not done and k[0]==roomid and k[1]==topicname:
            newMessage = " ".join(k[0:3])+" "+newText
            temp.append(newMessage)
            done = True
        else:
            temp.append(a)
    allMessages = temp
    response = jsonify({"success":True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    socketIo.run(app)