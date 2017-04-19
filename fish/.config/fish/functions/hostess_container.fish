function hostess_container --argument hostname container
    set -l container_ip (docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $container)

    if ping -c 1 $container_ip >/dev/null
        echo "$hostname -> $container ($container_ip)"

        sudo hostess add $hostname $container_ip
    end
end
