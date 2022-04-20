#!/usr/bin/env bash
API_START_COMMAND="rm -rf ./node_modules && npm install && npm run start"
UI_START_COMMAND="rm -rf ./node_modules package-lock.json && npm install && npm run dev"

tmux has-session -t Dev > /dev/null 2>&1
if [[ "$?" != "0" ]]
then
    tmux new-session -c "$PWD/api" -d -s Dev;
else
    tmux new-window -c "$PWD/api/";
fi

# SPLIT or SEPARATE
MODE=SPLIT
echo "$MODE"
if [[ "$MODE" == "SPLIT" ]]
then
    # Start API and UI in split view
    tmux rename-window "Runbook Buddy";
    tmux send-keys "$API_START_COMMAND" ENTER;
    tmux split-window -h -c "$PWD/ui";
    tmux send-keys "$UI_START_COMMAND" ENTER;
else
    # Start API and UI in separate windows
    tmux rename-window "Runbook Buddy - API";
    tmux send-keys "$API_START_COMMAND" ENTER;
    tmux new-window -c "$PWD/ui/" -n "Runbook Buddy - UI";
    tmux send-keys "$UI_START_COMMAND" ENTER;
fi

# We're all done so attach for the user
tmux select-window -t 0;
tmux attach-session -t Dev;
