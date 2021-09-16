#! /usr/bin/env bash
# install wordpress on amazon linux instance.
yum update -y
sudo amazon-linux-extras install -y php7.2
yum install mariadb mariadb-server httpd httpd-tools wget amazon-efs-utils -y
curl https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar --output /tmp/wp-cli.phar
chmod +x /tmp/wp-cli.phar
mv /tmp/wp-cli.phar /usr/local/bin/wp
sudo mount -t efs -o tls fs-e7565053:/ /var/www/html/wp-content/uploads/
cd /var/www/html
wp core download
wp core config --dbhost=localhost --dbname=wp_db --dbuser=root --dbpass=pass
wp db create
wp core install --url=node1.example.com --title="Your Blog Title" --admin_name=root --admin_password=pass --admin_email=you@example.com
wp config set UPLOADS /var/www/html/wp-content/uploads/
chmod 644 wp-config.php
chown apache:apache /var/www/html/ -R
rm /etc/httpd/conf.d/welcome.conf
systemctl enable httpd
systemctl start httpd
