#! /usr/bin/env bash
# install wordpress on amazon linux instance.
yum update -y
sudo amazon-linux-extras install -y php7.2
yum install mariadb mariadb-server httpd httpd-tools wget -y
curl https://wordpress.org/latest.tar.gz --output /tmp/wp.tar.gz
tar -xzf /tmp/wp.tar.gz -C /tmp
cp /tmp/wordpress/* /var/www/html/ -R
chown apache:apache /var/www/html/ -R
rm /etc/httpd/conf.d/welcome.conf
systemctl enable httpd
systemctl start httpd