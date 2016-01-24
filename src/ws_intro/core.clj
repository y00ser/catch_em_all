(ns ws-intro.core
  (:require [clojure.data.json :as json]
            [clojure.string :as s])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler]
           [org.webbitserver.handler StaticFileHandler]
           [org.webbitserver.handler EmbeddedResourceHandler])
  (:gen-class))


(def connections #{})

(defn sendGreetings []
  (loop [c (seq connections)]
    (when (seq c)
    (def theConnection (first c))
    (.send theConnection (json/json-str
                       {:type "greetings" :message (rand-int 100000000) }))
;;     (.send theConnection (json/json-str
;;                        {:type "function" :message (.toString "alert(\"sup\");") }))
    (recur (rest c)))
    )
)

(defn sendMessage [type message source]
  (loop [c (seq connections)]
    (when (seq c)
    (def theConnection (first c))
;    (when (not= theConnection source)
      (.send theConnection (json/json-str
                         {:type type :message message }))
      (println "message is sent: " message)
;    )
    (recur (rest c)))
    )
)

(def isGameStarted false)
(def gameCoordinator nil)
(def client nil)

(defn designatePlayers []
  (if (> (count connections) 1)
    (do
	  (def coordinator (first connections))
	  (def client (first (rest connections)))
	  (println "sending start command ")
	   (.send coordinator (json/json-str
	                        {:type "function" :message "setPlayerIndex(0);playGame=true;startGame();" }))
     (.send client (json/json-str
	                         {:type "function" :message "setPlayerIndex(1);" }))
     
     
     (def isGameStarted true)
	  ))
  (def isGameStarted false)
  )

(defn addConnection [conn]
  (println "conneciton added " (class conn))
  (def connections (conj connections conn))
  (when (= false isGameStarted)
    (designatePlayers)
   )
    
;  (sendGreetings)
    )


(defn removeConnection [conn]
  (println "removing connecion" conn)
  (when (= conn client)
    (.send coordinator (json/json-str
	                         {:type "function" :message "playGame=false;" }))
   )
  (def connections (disj connections conn))
  (designatePlayers)
)
    

(defn on-message [connection json-message]
  (let [message (-> json-message json/read-json (get-in [:data :message]))
        type (-> json-message json/read-json (get-in [:data :type]))
        ]
    (sendMessage type message connection)
    ))

(defn -main []
  (doto (WebServers/createWebServer 8080)
    (.add "/websocket"
          (proxy [WebSocketHandler] []
            (onOpen [c]  (addConnection c))
            (onClose [c] (removeConnection c))
            (onMessage [c j] (on-message c j))))

    (.add (EmbeddedResourceHandler. "web"))
    (.start)))

