#!/bin/bash
#  ############ ############ ############
#   Usage:
#   with defaults:
#          ./make.sh
#          ./make.sh server
#   or:
#          ARGS="-it" IMAGE="jmonkeyengine/buildenv-jme3:hugo" RUNTIME="docker" ./make.sh          
#          PORT="1313" ARGS="-it" IMAGE="jmonkeyengine/buildenv-jme3:hugo" RUNTIME="docker" ./make.sh   server
#  ############ ############ ############ 


if [ "$IMAGE" = "" ];
then
    export IMAGE="jmonkeyengine/buildenv-jme3:hugo"
fi

userUID=`id -u`
groupUID=`id -g`

if [ "$CMD" = "" ];
then
    export CMD="hugo $@"
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


if [ "$PORT" = "" ];
then
    if [ "$CMD"  = "hugo server" ];
    then
        export PORT="1313"
    fi
fi

if [ "$PORT" != "" ];
then
    export ARGS="$ARGS -p$PORT:1313"
fi

if [ "$CMD"  = "hugo server" ];
then
    export CMD="$CMD --bind 0.0.0.0"    
fi

set -x
$RUNTIME run  -v"$PWD:$PWD" $RUN_AS -w $PWD $ARGS --rm $IMAGE $CMD
