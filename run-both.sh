#!/usr/bin/env bash
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
    tmux send-keys 'npm run start' ENTER;
    tmux split-window -h -c "$PWD/ui";
    tmux send-keys 'npm run start' ENTER;
else
    # Start API and UI in separate windows
    tmux rename-window "Runbook Buddy - API";
    tmux send-keys 'npm run start' ENTER;
    tmux new-window -c "$PWD/ui/" -n "Runbook Buddy - UI";
    tmux send-keys 'npm run start' ENTER;
fi

# We're all done so attach for the user
tmux select-window -t 0;
tmux attach-session -t Dev;
