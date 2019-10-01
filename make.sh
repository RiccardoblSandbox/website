#!/bin/bash
#  ############ ############ ############
#   Usage:
#   with defaults:
#          ./make.sh
#   or:
#         ARGS="-it" IMAGE="jmonkeyengine/buildenv-jme3:hugo" RUNTIME="docker" ./make.sh          
#  ############ ############ ############ 

if [ "$IMAGE" = "" ];
then
    export IMAGE="jmonkeyengine/buildenv-jme3:hugo"
fi

userUID=`id -u`
groupUID=`id -g`

if [ "$CMD" = "" ];
then
    CMD="hugo $@"
fi

if [ "$ARGS" = "" ];
then
    if [ "$HEADLESS" = "" ];
    then
        export ARGS="$ARGS -it"
    fi
fi

if [ "$RUNTIME" = "" ];
then
    if [ "`which podman`" != "" ];then  
        export RUNTIME="podman"
    else
        export RUNTIME="docker"
        if [ "$SUDO_USER" != "" ];
        then
            userUID=`id -u $SUDO_USER`
            groupUID=`id -g $SUDO_USER`
        fi
        ARGS="$ARGS -u=$userUID:$groupUID"
    fi
fi

$RUNTIME run  -v"$PWD:$PWD" $RUN_AS -w $PWD $ARGS --rm $ARGS $IMAGE $CMD
