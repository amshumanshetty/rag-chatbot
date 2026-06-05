import { useState, useEffect, useRef } from "react";

function App(){
  const [file,setFile] = useState(null);
  const [question,setQuestion] = useState("");
  const [messages,setMessages] = useState([]);
  const [loading,setLoading] = useState(false);
  const [uploaded,setUploaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(()=>{
    chatEndRef.current?.scrollIntoView({
      behaviour:"smooth",
    });
  },[messages]);

  const uploadPDF = async ()=>{

    if (!file) return;

    const formData = new FormData();
    formData.append("file",file);

    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/upload",{
      method:"POST",
      body:formData,
    });

    await response.json();

    setUploaded(true);
    setLoading(false);
  };

  const toggleSources = (index)=>{
    const updatedMessages = [...messages];

    updatedMessages[index].showSources = !updatedMessages[index].showSources;

    setMessages(updatedMessages);
  }


  const askQuestion = async ()=>{
    if (!question) return;

    setLoading(true);
    
    const response = await fetch("http://127.0.0.1:8000/ask",{
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body : JSON.stringify({question}),
    });
    
    const data = await response.json();

    setMessages((prev)=>[
      ...prev,
      {
        role:"user",
        content:question
      },
      {
        role:"ai",
        content:data.answer,
        sources:data.sources,
        showSources:false  
      }
    ]);

    setQuestion("");

    setLoading(false);
  };

  return(
    <div
     style={{
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      backgroundColor:"#ffffff",
    }}
    >
        <div
          style={{
            flex:1,
            padding:"20px",
            overflowY:"auto"
          }}
        >
          <div
            style={{
              maxWidth:"1200px",
              margin:"0 auto"
            }}
          >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign:"center",
                marginTop:"120px",
                color:"#666"
              }}
            >
              <h1>RAG Chatbot</h1>
              <p>Upload a PDF and start chatting</p>
            </div>
          ) : (
          messages.map((msg,index) => (
              <div
                key={index}
                style={{
                  display:"flex",
                  justifyContent:
                  msg.role==="user"
                  ?"flex-end"
                  :"flex-start",
                  marginBottom:"20px",
                  paddingLeft:"20px",
                  paddingRight:"20px",
                }}
              >
                <div
                 style={{
                  maxWidth:"55%",
                  padding:"14px 18px",
                  borderRadius:"18px",
                  lineHeight:"1.5",
                  backgroundColor:
                    msg.role === "user"
                      ? "#111827"
                      : "#ffffff",
                  color:
                    msg.role === "user"
                      ?"white"
                      :"black",    
                  boxShadow:"0 2px 8px rgba(0,0,0,0.08)"
                 }}                    
                >
                  {msg.content}

                  {msg.role === "ai" && msg.sources && (
                    <button
                      onClick={()=>toggleSources(index)}
                      style={{
                        display:"block",
                        marginTop:"10px",
                        border:"none",
                        background:"transparent",
                        color:"#2563eb",
                        cursor:"pointer",
                      }}
                    >
                      {msg.showSources
                        ? "Hide Sources"
                        : "Show Sources"
                      }
                    </button>
                  )}

                  {msg.showSources && msg.sources && (
                    <div
                      style={{
                        marginTop:"10px",
                        padding:"10px",
                        backgroundColor:"#f5f5f5",
                        borderRadius:"8px",
                        fontSize:"14px",
                      }}
                    >
                      {msg.sources.map((sources,i)=>(
                        <div key={i}>
                          {sources.substring(0,150)}...
                        </div>
                      ))}
                    </div>
                  )}
                 </div>
                 </div>  
                 
            ))
          )}
          </div>
        <div ref={chatEndRef}></div>
        </div>


        <div
        style={{
          backgroundColor:"white",
          borderTop:"1px solid #ddd",
          padding:"15px 25px",
          position:"sticky",
          bottom:0,
        }}
        >
        <div
         style={{
          maxWidth:"1200px",
          margin:"0 auto",
         }} 
        >
          <div
            style={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              gap:"10px",
              marginBottom:"10px",
            }}
          >
            <input
            type = "file"
            accept=".pdf"
            onChange={(e)=>setFile(e.target.files[0])}
            />

            <button
            onClick={uploadPDF}
            style={{
              padding:"10px 16px",
              cursor:"pointer",
            }}
            >
            Upload PDF
            </button>

            {uploaded && (
              <span style={{color:"green"}}>
                PDF uploaded Successfully
              </span>
            )}
          </div>
          
          <div 
            style={{
              display:"flex",
              justifyContent:"center",
              gap:"10px",
            }}
          >
            <input
              type = "text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e)=>setQuestion(e.target.value)}
              onKeyDown={(e)=>{
                if(e.key === "Enter"){
                  askQuestion();
                }
              }}
              style={{
                width:"700px",
                padding:"14px",
                borderRadius:"8px",
                border:"1px solid #ccc",
                fontSize:"16px",
              }}
            />
            
            <button
              onClick={askQuestion}
              disabled={!uploaded || loading}
              style = {{
                padding:"14px 20px",
                borderRadius:"10px",
                border:"None",
                backgroundColor:"#06070a",
                color:"white",
                cursor:"pointer",
              }}
            >Send
            </button>
          </div>

          {loading && (
            <p style={{
              textAlign:"center",  
              marginTop:"20px"
            }}>
              Thinking...
            </p>
          )}

            
          </div>
      </div>    
    </div>
  );
}

export default App;