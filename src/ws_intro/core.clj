(ns ws-intro.core
  (:require [clojure.data.json :as json]
            [clojure.string :as s])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler]
           [org.webbitserver.handler StaticFileHandler]
           [org.webbitserver.handler EmbeddedResourceHandler])
  (:gen-class))

(defn on-message [connection json-message]
  (let [message (-> json-message json/read-json (get-in [:data :message]))]
    (.send connection (json/json-str
                       {:type "upcased" :message (s/upper-case message) }))))

(defn -main []
  (doto (WebServers/createWebServer 8080)
    (.add "/websocket"
          (proxy [WebSocketHandler] []
            (onOpen [c] (println "opened" c))
            (onClose [c] (println "closed" c))
            (onMessage [c j] (on-message c j))))

    (.add (EmbeddedResourceHandler. "web"))
    (.start)))
