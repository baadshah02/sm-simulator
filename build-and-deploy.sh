#!/bin/bash
sudo docker build -t smith-manoeuvre-simulator:latest . && sudo docker stop smith-manoeuvre-simulator && sudo docker rm smith-manoeuvre-simulator && sudo docker run -d --name smith-manoeuvre-simulator --restart always -p 3001:80 smith-manoeuvre-simulator:latest
