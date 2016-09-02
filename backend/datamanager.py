# TEAMTOCK DATA MANAGER
import os
import time
import uuid

cache = {}
id_last_ping = {}
_total_time_cache = 0
_changes_since_last_write = 0
_data_folder = "/Users/Main/Desktop/teamtock/data/"


def time_epoch():
    return int(time.time())


def get_sessions():
    global id_last_ping
    return len(id_last_ping.keys())


def ping(id):
    global id_last_ping
    id_last_ping[id] = time_epoch()


def clean_cache():
    print("...cleaning cache")
    global cache, id_last_ping
    for key in cache.keys():
        if id_last_ping.has_key(key):
            if(time_epoch() - id_last_ping[key] > 15):
                write_id_time(key, get_time_from_id(key))
                del cache[key]
                del id_last_ping[key]


def increment_changes():
    global _changes_since_last_write
    _changes_since_last_write += 1
    check_time_to_write()


def get_time_from_id(id):
    global cache
    prep_cache_for_id(id)
    return cache[id]


def add_time_to_id(id, time):
    global cache, _total_time_cache
    prep_cache_for_id(id)
    cache[id] = cache[id] + time
    _total_time_cache += time
    increment_changes()


def get_total_time():
    global _total_time_cache
    return _total_time_cache


def generate_new_id():
    id = uuid.uuid4()
    if check_id_exists(id):
        return generate_new_id()
    return id


def get_data_file(id):
    global _data_folder
    path = _data_folder + str(id) + ".txt"
    return path


def check_id_exists(id):
    global cache, _data_folder
    if id in cache:
        return True
    return os.path.isfile(_data_folder + str(id) + ".txt")


def write_cache():
    print ("...writing cache to file")
    global cache
    for key, value in cache.iteritems():
        write_id_time(key, value)


def write_id_time(id, time):
    data_file = get_data_file(id)
    f = open(data_file, "r+")
    f.truncate()
    f.write(str(time))
    f.close()


def check_time_to_write():
    global _changes_since_last_write
    if _changes_since_last_write >= 5:
        write_cache()
        clean_cache()
        _changes_since_last_write = 0


def prep_cache_for_id(id):
    global cache
    if id not in cache:
        load_id_into_cache(id)


def read_datafile(file):
    f = open(file, "a")
    f.close()
    f = open(file, "r")
    lines = f.readlines()
    if len(lines) > 0:
        num = int(lines[0])
    else:
        num = 0
    f.close()
    return num


def load_id_into_cache(id):
    global _data_folder, cache
    time = 0
    path = _data_folder + str(id) + ".txt"
    time = read_datafile(path)
    cache[id] = time
    return time


def init():
    global _data_folder, _total_time_cache
    time_total = 0
    for i in os.listdir(_data_folder):
        f = open(_data_folder + i, "r")
        try:
            num = f.readline()
            print i + ": " +num
            time_total += int(num)
        except Exception as e:
            print("Error during datamanager init, loading timefile " + i + ": "+ e.message)
            print e
            # whoops
    _total_time_cache = time_total
