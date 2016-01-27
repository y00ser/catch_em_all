(ns ws-intro.core
  (:require [clojure.data.json :as json]
            [clojure.string :as s])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler]
           [org.webbitserver.handler StaticFileHandler]
           [org.webbitserver.handler EmbeddedResourceHandler])
  (:gen-class))


(def connections #{})
(def isGameStarted false)
(def gameCoordinator nil)
(def client nil)

(defn gameRestarter [])
(defn addConnection [conn])
(defn removeConnection [conn])

(defn sendGeneralMessage [message]
  (loop [c (seq connections)]
    (when (seq c)
      (def theConnection (first c))
      (.send theConnection (json/json-str
                             {:type "generalInfo" :message message }))
      (recur (rest c)))
    )
  )

(defn sendMessage [type message]
  (loop [c (seq connections)]
    (when (seq c)
      (def theConnection (first c))
      (.send theConnection (json/json-str
                             {:type type :message message }))
      (recur (rest c)))
    )
  )

(defn designatePlayers []
  (if (> (count connections) 1)
    (do
      (println "designating players ")
      (def gameCoordinator (first connections))
      (def client (first (rest connections))) 
        (println "client is " client)
        (println "coordinator is " gameCoordinator)
      (.send gameCoordinator (json/json-str
                               {:type "function" :message "setPlayerIndex(0);playGame=true;startGame();" }))
      (.send client (json/json-str
                      {:type "function" :message "setPlayerIndex(1);" }))
      (def isGameStarted true)
      )
    (def isGameStarted false)
 ))

(defn addConnection [conn]
  (.send conn (json/json-str
              {:type "function" :message "setPlayerIndex(2);" }))
  (println "conneciton added " conn)
  (def connections (conj connections conn))
  (when (= false isGameStarted)
    (designatePlayers)
    )
  )

(defn removeConnection [conn]
  (println "removing connecion" conn)
  (when (= conn client)
    (println "sending message to coordinator")
    (.send gameCoordinator (json/json-str
                             {:type "function" :message "playGame=false;" }))
    )
  (println "managing collections" connections conn)
  (def connections (disj connections conn))
  (println "when?")
  (when (and isGameStarted (or (= conn client) (= conn gameCoordinator)))
                 (designatePlayers)
                 )
  (println "returning")
  )
  
  
  
  (defn on-message [connection json-message]
    (let [message (-> json-message json/read-json (get-in [:data :message]))
          type (-> json-message json/read-json (get-in [:data :type]))
          ]
      (sendMessage type message)
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
  
  