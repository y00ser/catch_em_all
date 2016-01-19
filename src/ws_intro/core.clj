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
    (when (not= theConnection source)
      (.send theConnection (json/json-str
                         {:type type :message message }))
    )
    (recur (rest c)))
    )
)


(defn addConnection [conn]
  (println "conneciton added " (class conn))
  (def connections (conj connections conn))
  (sendGreetings)
    )

(defn removeConnection [conn]
  (println "removing connecion" conn)
  (def connections (disj connections conn))
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

