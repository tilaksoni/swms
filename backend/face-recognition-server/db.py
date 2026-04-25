import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="smartworkers",          # change if different
        user="postgres",
        password="postgres",
        host="localhost",
        port="5432"
    )