from Acquisition import aq_inner
from Products.Five import BrowserView
from plone.app.multilingual.subscriber import createdEvent

from collective.leadmedia.utils import addCropToTranslation
from plone.app.multilingual.interfaces import ITranslatable
from plone.app.multilingual.interfaces import ITranslationManager

from plone.app.contenttypes.browser.collection import CollectionView
from plone.app.uuid.utils import uuidToCatalogBrain
from plone.dexterity.utils import safe_unicode

from datetime import date
from DateTime import DateTime
import time
from plone.app.event.base import date_speller

from Acquisition import aq_inner
from zope.component import getUtility
from zope.intid.interfaces import IIntIds
from zope.security import checkPermission
from zc.relation.interfaces import ICatalog
from plone.memoize.view import memoize

def generate_person_title(firstname, middlename, lastname, nationality, year):
    names = ""
    names_list = [firstname, middlename, lastname]
    names = " ".join([name for name in names_list if name not in ['', None]])

    extra = []
    if nationality:
        extra.append(nationality)
    if year:
        extra.append(year)

    extra_text = ', '.join(extra)

    if names and extra_text:
        final_text = "%s (%s)" %(names, extra_text)
        return final_text
    elif names and not extra_text:
        final_text = "%s" %(names)
        return final_text
    else:
        return ''


def translateArtists(language="en"):
    import plone.api
    import transaction
    from plone.app.multilingual.interfaces import ITranslationManager
    
    container_path = "/nl/online-archief/kunstenaars"

    with plone.api.env.adopt_user(username="admin"):
        container = plone.api.content.get(path=container_path)

        total = len(list(container))
        curr = 0

        for _id in list(container):
            curr += 1
            print "Translating Person %s / %s to '%s'" %(curr, total, language)
            person = container[_id]

            if not ITranslationManager(person).has_translation(language):
                ITranslationManager(person).add_translation(language)
                person_translated = ITranslationManager(person).get_translation(language)
                person_translated.title = person.title
                person_translated.firstname = person.firstname
                person_translated.lastname = person.lastname
                person_translated.nationality = person.nationality
                person_translated.year = person.year
                person_translated.reindexObject()
                transaction.get().commit()
                print "Translation added for Person '%s'" %(person.title)
            else:
                print "Person '%s' already has a translation to '%s'" %(person.title, language)

    return True

def createArtistsRelations():
    import csv
    import plone.api
    import transaction
    from zope import component
    from zope.intid.interfaces import IIntIds
    from z3c.relationfield import RelationValue
    from zope.event import notify
    from zope.lifecycleevent import ObjectModifiedEvent

    intids = component.getUtility(IIntIds)

    file_path = "/var/www/kunsthalkade-dev/import/artists-v4.tsv"
    container_path = "/nl/online-archief/kunstenaars"
    #container_path = "/nl/intk/test-artists-import"

    """ Read CSV """
    csv_file = open(file_path, 'r')
    artists_list = [row for row in csv.reader(csv_file.read().splitlines())]

    artists = artists_list[1:]

    """ Create content types """
    with plone.api.env.adopt_user(username="admin"):
        """ Get container """
        container = plone.api.content.get(path=container_path)
        portal = plone.api.portal.get()
        not_found_exhibitions = []
        artists_without_relations = []
        artists_not_found = []

        for elem in artists:
            try:
                artist = elem[0].split('\t')
                firstname = artist[0]
                lastname = artist[2]
                exhibition = artist[5].strip()

                if exhibition:
                    """print "-- Relation --"
                    print "Artist: %s %s" %(firstname, lastname)
                    print "Exhibition: %s" %(exhibition)
                    print "---\n" """

                    """ Find exhibition """
                    exhibitions = plone.api.content.find(context=portal, portal_type='Event', Title=exhibition)
                    if exhibitions:
                        exhibition_obj = None
                        if len(exhibitions) > 1:
                            exhibition_obj = [ex for ex in exhibitions if 'online-archief' or 'nu-en-verwacht' in ex.getURL()][0].getObject()
                        else:
                            exhibition_obj = exhibitions[0].getObject()
                        
                        """ Find artist """
                        artists_results = plone.api.content.find(context=portal, Language='nl', portal_type="Person", Title="*%s*" %(lastname.strip()))
                        artist_obj = None
                        for res in artists_results:
                            if res.getObject().firstname == firstname:
                                artist_obj = res.getObject()
                                break

                        if artist_obj:
                            person_id = intids.getId(artist_obj)
                            relation_value = RelationValue(person_id)
                            _ids = [rel.to_id for rel in getattr(exhibition_obj, 'relatedItems', [])]
                            if person_id not in _ids:
                                if not getattr(exhibition_obj, 'relatedItems', None):
                                    exhibition_obj.relatedItems = []
                                exhibition_obj.relatedItems.append(relation_value)
                                exhibition_obj.reindexObject()
                                notify(ObjectModifiedEvent(exhibition_obj))
                                exhibition_obj.reindexObject()
                                transaction.get().commit()
                                print "Creating - Relation from '%s' to '%s %s' created" %(exhibition, firstname, lastname)
                            else:
                                print "Skipping - Relation from '%s' to '%s %s' already created" %(exhibition, firstname, lastname)
                        else:
                            print "Artists '%s %s' not found" %(firstname, lastname)
                            if "%s %s"%(firstname, lastname) not in artists_without_relations:
                                artists_not_found.append("%s %s"%(firstname, lastname))

                    else:
                        #print "Exhibition '%s' was not found" %(exhibition)
                        if exhibition not in not_found_exhibitions:
                            not_found_exhibitions.append(exhibition)

                else:
                    #print "Artist '%s %s' not related with an Exhibition" %(firstname, lastname)
                    if "%s %s"%(firstname, lastname) not in artists_without_relations:
                        artists_without_relations.append("%s %s"%(firstname, lastname))
                
            except:
                print "Error ocurred for artist %s" %(str(elem))
                pass

        print "Total of artists without relations: %s" %(len(artists_without_relations))
        print "Total of not found artists: %s" %(len(artists_not_found))
        print "Total of not found exhibitions: %s" %(len(not_found_exhibitions))
        print "\n"
        print "Not found exhibitions:"
        print not_found_exhibitions
        print "\n"
        print "Artists without relations:"
        print artists_without_relations
        print "\n"
        print "Artists not found:"
        print artists_not_found

        return True
    return True

def importExhibitions():
    import csv
    import plone.api
    import transaction
    import pytz
    from datetime import datetime
    from plone.app.event.dx.behaviors import IEventBasic

    file_path = "/var/www/kunsthalkade-dev/import/exhibitions-v2.tsv"
    container_path = "/nl/online-archief/tentoonstellingen"

    """ Read CSV """
    csv_file = open(file_path, 'r')
    exhibitions_list = [row for row in csv.reader(csv_file.read().splitlines())]

    exhibitions = exhibitions_list[1:]

    """ Create content types """
    with plone.api.env.adopt_user(username="admin"):
        portal = plone.api.portal.get()
        """ Get container """
        container = plone.api.content.get(path=container_path)

        for elem in exhibitions:
            try:
                exhibition = elem[0].split('\t')
                title = exhibition[0]
                startdate = exhibition[1]
                enddate = exhibition[2]
                year = exhibition[3]
                
                exhibitions = plone.api.content.find(context=portal, portal_type='Event', Title=title, Language="nl")
                if exhibitions:
                    print "Found for exhibition '%s'" %(title)
                else:
                    print "Not found for exhibition '%s'" %(title)
                
                    """print "-- Exhibition --"
                    print "Title: %s" %(title)
                    print "Start date: %s" %(startdate)
                    print "End date: %s" %(enddate)
                    print "Year: %s" %(year)
                    print "---\n" """
                    
                    TIMEZONE = "Europe/Amsterdam"

                    if startdate and enddate:
                        ## Format mm/dd/yyyy
                        tzinfo = pytz.timezone(TIMEZONE)
                        startdate_datetime = datetime.strptime(startdate, "%m/%d/%Y")
                        patched_startdate = tzinfo.localize(startdate_datetime)
                       
                        enddate_datetime = datetime.strptime(enddate, "%m/%d/%Y")
                        patched_enddate = tzinfo.localize(enddate_datetime)

                        try:
                            created_obj = plone.api.content.create(container=container, type="Event", start=patched_startdate, end=patched_enddate, whole_day=True, title=title)
                            plone.api.content.transition(obj=created_obj, to_state="published")
                            created_obj.reindexObject()
                            print "Exhibition '%s' created" %(title)
                            transaction.get().commit()
                        except:
                            raise
                    else:
                        print "[Warning] Exhibition '%s' not created - start and end date not available" %(title)
                
            except:
                print "Error ocurred for exhibition %s" %(str(elem))
                pass

        return True
    return True



def importArtists():
    import csv
    import plone.api
    import transaction

    file_path = "/var/www/kunsthalkade-dev/import/artists-v4.tsv"
    container_path = "/nl/online-archief/kunstenaars"
    #container_path = "/nl/intk/test-artists-import"

    """ Read CSV """

    csv_file = open(file_path, 'r')
    artists_list = [row for row in csv.reader(csv_file.read().splitlines())]
    #artists_list = list(csv_reader)

    artists = artists_list[1:]

    """ Create content types """
    with plone.api.env.adopt_user(username="admin"):
        """ Get container """
        container = plone.api.content.get(path=container_path)

        for elem in artists:
            
            try:
                artist = elem[0].split('\t')
                firstname = artist[0]
                middlename = artist[1]
                lastname = artist[2]
                nationality = artist[3]
                year = artist[4]

                title = generate_person_title(firstname, middlename, lastname, nationality, year)
                
                """print "-- Artist --"
                print "Firstname: %s" %(firstname)
                print "Middlename: %s" %(middlename)
                print "Lastname: %s" %(lastname)
                print "Nationality: %s" %(nationality)
                print "Year: %s" %(year)
                print "Title: %s" %(title)
                print "---\n" """

                try:
                    created_obj = plone.api.content.create(container=container, type="Person", title=title, firstname=firstname, middlename=middlename, lastname=lastname, nationality=nationality, year=year)
                    plone.api.content.transition(obj=created_obj, to_state="published")

                    print "Artist '%s' created" %(title)
                    transaction.get().commit()
                except:
                    pass
                
            except:
                print "Error ocurred for artist %s" %(str(elem))
                pass

        return True


    return True


class SimpleListingView(CollectionView):
    """ Class for Simple Listing view """

    def getImageScale(self, item):
        if item.portal_type == "Image":
            return item.getURL()+"/@@images/image/large"
        if getattr(item, 'leadMedia', None) != None:
            uuid = item.leadMedia
            media_object = uuidToCatalogBrain(uuid)
            if media_object:
                return media_object.getURL()+"/@@images/image/large"
            else:
                return None
        else:
            return None

    @memoize
    def get_relations(self, brain):
        catalog = getUtility(ICatalog)
        intids = getUtility(IIntIds)
        result = []
        attribute_name = "relatedItems"
        item = brain.getObject()

        init_id = intids.getId(item)

        for rel in catalog.findRelations(
                dict(to_id=init_id,
                from_attribute=attribute_name)
            ):

            obj = intids.queryObject(rel.from_id)
            if obj is not None:
                result.append(obj)

        structure = []
        for event in result:
            structure.append("<a href='%s'>%s</a>" %(event.absolute_url(), event.title))

        final_result = "<span>, </span>".join(structure)
        return final_result

    def date_speller(self, date):
        return date_speller(self.context, date)

class ContextToolsView(BrowserView):

    def isEventPast(self, event):
        """ Checks if the event is already past """
        if event.portal_type != 'Event':
            return False
        else:
            try:
                t = DateTime(time.time())
                if event.end is not None:
                    end = DateTime(event.end)
                    return end.year() < t.year() or (end.year() == t.year() and end.month() < t.month()) or(end.year() == t.year() and end.month() == t.month() and end.day() < t.day())
                else:
                    start = DateTime(event.start)
                    return start.year() < t.year() or (start.year() == t.year() and start.month() < t.month()) or(start.year() == t.year() and start.month() == t.month() and start.day() < t.day())
            except:
                return False
        return True

class OnlineExperienceView(CollectionView):

    def find_orientation(self, item):
        if type(item) == str:
            if item == "L":
                return "landscape"
            else:
                return "portrait"

        item_class = ""
        if item.portal_type == "Image":
            image_obj = item.getObject()
            if getattr(image_obj, 'image', None):
                try:
                    w, h = image_obj.image.getImageSize()
                    if w > h:
                        item_class = "%s" %('landscape')
                    else:
                        item_class = "%s" %('portrait')
                except:
                    return item_class
        elif item.hasMedia:
            image = uuidToCatalogBrain(item.leadMedia)
            image_obj = image.getObject()
            if getattr(image_obj, 'image', None):
                try:
                    w, h = image_obj.image.getImageSize()
                    if w > h:
                        item_class = "%s" %('landscape')
                    else:
                        item_class = "%s" %('portrait')
                except:
                    return item_class

        return item_class

    def getImageProperties(self, item):
        link = item.getURL()+"/view"
        title = item.Title
        description = item.Description

        try:
            if item.portal_type == "Image":
                image = item.getObject()
                parent = image.aq_parent
                if parent.portal_type == "Folder":
                    if parent.id == "slideshow":
                        obj = parent.aq_parent
                        if obj.portal_type == "Object":
                            title = obj.title
                            description = obj.description
                            link = obj.absolute_url()

        except:
            raise

        return {"link": link, "title": title, "description": description}

    def pairItems(self, results):
        # L P L L L P P P
        TEST_INPUT = ["L", "P", "L", "L", "L", "P", "P", "P"]
        FIRST_ITEM = 0
        
        items = results
        sequence_items = items._sequence
        total_items = len(sequence_items)
        items_checked = []
        final_patterns = []

        right = True
        previous_pair = ""

        for i in range(total_items):

            if i not in items_checked:

                right_pattern = "right" if right else "left"
                pattern = {
                    "size": "small",
                    "orientation": self.find_orientation(sequence_items[i]),
                    "position": "pair",
                    "clearfix": False,
                    "item": sequence_items[i],
                    "right": right_pattern,
                    "bottom": ""
                }
               
                if i == FIRST_ITEM:
                    pattern['position'] = "single"
                    pattern['size'] = "big"
                    final_patterns.append(pattern)
                    items_checked.append(i)
                    if right:
                        right = False
                    else:
                        right = True
                else:
                    if i+1 < total_items:
                        next_orientation = self.find_orientation(sequence_items[i+1])

                        if next_orientation == pattern["orientation"] == "landscape":
                            pattern["position"] = "single"
                            pattern["size"] = "big"
                            final_patterns.append(pattern)
                            if right:
                                right = False
                            else:
                                right = True

                            previous_pair = ""
                        else:
                            new_pattern = {
                                "size": pattern['size'],
                                "orientation": pattern['orientation'],
                                "position": "pair",
                                "clearfix": True,
                                "item": sequence_items[i+1],
                                "right": pattern['right'],
                                "bottom": pattern['bottom']
                            }
                            new_pattern["orientation"] = next_orientation

                            if next_orientation == pattern['orientation'] == "portrait":
                                pattern['size'] = "big"
                                new_pattern['size'] = "big"

                            if not previous_pair:
                                if right:
                                    pattern['bottom'] = "bottom"
                                    new_pattern['bottom'] = "up"
                                else:
                                    new_pattern['bottom'] = "bottom"
                                    pattern['bottom'] = "up"
                            else:
                                if previous_pair == "bottom":
                                    pattern['bottom'] = "up"
                                    new_pattern['bottom'] = "bottom"
                                    previous_pair = "bottom"
                                else:
                                    pattern['bottom'] = "bottom"
                                    new_pattern['bottom'] = "up"
                                    previous_pair = "up"

                            final_patterns.append(pattern)
                            final_patterns.append(new_pattern)
                            items_checked.append(i)
                            items_checked.append(i+1)
                    else:
                        pattern['position'] = "single"
                        pattern['size'] = "big"
                        final_patterns.append(pattern)
            else:
                pass

        return final_patterns


    def getImageObject(self, item):
        if item.portal_type == "Image":
            return item.getURL()+"/@@images/image/large"
        if item.leadMedia != None:
            uuid = item.leadMedia
            media_object = uuidToCatalogBrain(uuid)
            if media_object:
                return media_object.getURL()+"/@@images/image/large"
            else:
                return None
        else:
            return None

    def getImageClass(self, item, has_media=False):

        item_class = "entry"

        if item.portal_type == "Image":
            image_obj = item.getObject()
            if getattr(image_obj, 'image', None):
                try:
                    w, h = image_obj.image.getImageSize()
                    if w > h:
                        item_class = "%s %s" %(item_class, 'landscape')
                    else:
                        item_class = "%s %s" %(item_class, 'portrait')
                except:
                    return item_class
        elif has_media:
            image = uuidToCatalogBrain(item.leadMedia)
            image_obj = image.getObject()
            if getattr(image_obj, 'image', None):
                try:
                    w, h = image_obj.image.getImageSize()
                    if w > h:
                        item_class = "%s %s" %(item_class, 'landscape')
                    else:
                        item_class = "%s %s" %(item_class, 'portrait')
                except:
                    return item_class

        return item_class


class FullScreenCollectionView(CollectionView):

    def getLeadMediaURL(self, item, scale="large"):
        if item.portal_type == "Image":
            url = item.getURL()
            if url:
                return "%s/@@images/image/%s" %(item.getURL(), scale)
            else:
                return None
        if item.leadMedia != None:
            media_object = uuidToCatalogBrain(item.leadMedia)
            if media_object:
                return "%s/@@images/image/%s" %(media_object.getURL(), scale)
            else:
                return None
        return None








def objectTranslated(ob, event):
    if ob:
        if ITranslatable.providedBy(ob):
            if getattr(ob, 'language', None) == "en" and getattr(ob, 'portal_type', None) in ["Document", "Event"]:
                createdEvent(ob, event)
                if not hasattr(ob, 'slideshow'):
                    if ITranslationManager(ob).has_translation('nl'):
                        original_ob = ITranslationManager(ob).get_translation('nl')
                        
                        if hasattr(original_ob, 'slideshow'):
                            slideshow = original_ob['slideshow']
                            ITranslationManager(slideshow).add_translation('en')
                            slideshow_trans = ITranslationManager(slideshow).get_translation('en')
                            slideshow_trans.title = slideshow.title
                            slideshow_trans.portal_workflow.doActionFor(slideshow_trans, "publish", comment="Slideshow published")
                            
                            for sitem in slideshow:
                                if slideshow[sitem].portal_type == "Image":
                                    ITranslationManager(slideshow[sitem]).add_translation('en')
                                    trans = ITranslationManager(slideshow[sitem]).get_translation('en')
                                    trans.image = slideshow[sitem].image
                                    addCropToTranslation(slideshow[sitem], trans)

                            ob.reindexObject()
                            ob.reindexObject(idxs=["hasMedia"])
                            ob.reindexObject(idxs=["leadMedia"])
                        else:
                            # no slideshow folder
                            pass
                    else:
                        # no translation
                        pass
                else:
                    # has slideshow
                    pass
            else:
                # wrong language
                pass
    else:
        # invalid object
        pass

    return


