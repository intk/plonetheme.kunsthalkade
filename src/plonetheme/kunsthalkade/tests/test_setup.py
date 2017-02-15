# -*- coding: utf-8 -*-
"""Setup tests for this package."""
from plonetheme.kunsthalkade.testing import PLONETHEME_MODERNBASE_INTEGRATION_TESTING  # noqa
from plone import api

import unittest


class TestSetup(unittest.TestCase):
    """Test that plonetheme.kunsthalkade is properly installed."""

    layer = PLONETHEME_MODERNBASE_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')

    def test_product_installed(self):
        """Test if plonetheme.kunsthalkade is installed."""
        self.assertTrue(self.installer.isProductInstalled(
            'plonetheme.kunsthalkade'))

    def test_browserlayer(self):
        """Test that IPlonethemekunsthalkadeLayer is registered."""
        from plonetheme.kunsthalkade.interfaces import (
            IPlonethemeModernBaseLayer)
        from plone.browserlayer import utils
        self.assertIn(IPlonethemeModernBaseLayer, utils.registered_layers())


class TestUninstall(unittest.TestCase):

    layer = PLONETHEME_MODERNBASE_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer['portal']
        self.installer = api.portal.get_tool('portal_quickinstaller')
        self.installer.uninstallProducts(['plonetheme.kunsthalkade'])

    def test_product_uninstalled(self):
        """Test if plonetheme.kunsthalkade is cleanly uninstalled."""
        self.assertFalse(self.installer.isProductInstalled(
            'plonetheme.kunsthalkade'))

    def test_browserlayer_removed(self):
        """Test that IPlonethemekunsthalkadeLayer is removed."""
        from plonetheme.kunsthalkade.interfaces import IPlonethemeModernBaseLayer
        from plone.browserlayer import utils
        self.assertNotIn(IPlonethemeModernBaseLayer, utils.registered_layers())
