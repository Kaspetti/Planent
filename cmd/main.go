package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)


func main() {
  r := gin.Default() 
  r.SetTrustedProxies(nil)

  r.Static("/static", "./static")

  r.LoadHTMLGlob("./templates/*")
  r.GET("/", func(c *gin.Context) {
    c.HTML(http.StatusOK, "index.html", gin.H {
      "title": "Planent 2",
    })
  })

  r.Run("127.0.0.1:8080")
}
